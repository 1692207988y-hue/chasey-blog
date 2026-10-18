import { XMLParser } from "fast-xml-parser";

interface Env {
  STATS_DB: D1Database;
  ADMIN_TOKEN?: string;
}

type SourceKind = "rss" | "json" | "html";

interface Source {
  id: number;
  name: string;
  slug: string;
  kind: SourceKind;
  url: string;
  config: string;
  etag: string | null;
  last_modified: string | null;
}

interface RawItem {
  externalId: string;
  url: string;
  title: string;
  summary: string;
  author?: string;
  publishedAt?: string;
}

interface FetchResult {
  items: RawItem[];
  etag: string | null;
  lastModified: string | null;
}

const USER_AGENT = "ChaseyAggregator/1.0 (+https://blog.chasey.top/about)";
const MAX_ITEMS_PER_SOURCE = 30;
const MAX_SUMMARY_LENGTH = 400;

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "#text" in value) {
    return String((value as { "#text": unknown })["#text"]);
  }
  return "";
}

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function canonicalUrl(raw: string, base?: string): string {
  const url = new URL(raw, base);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("unsupported protocol");
  }
  url.hash = "";
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  const queryKeys: string[] = [];
  url.searchParams.forEach((_value, key) => queryKeys.push(key));
  for (const key of queryKeys) {
    if (/^(utm_|fbclid|gclid|mc_|ref$|source$)/i.test(key)) {
      url.searchParams.delete(key);
    }
  }
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString();
}

function parseConfig(source: Source): Record<string, unknown> {
  try {
    return JSON.parse(source.config || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function getPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, value);
}

function parseRss(xml: string, source: Source): RawItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text"
  });
  const doc = parser.parse(xml);
  const items: RawItem[] = [];
  const channel = doc?.rss?.channel ?? doc?.["rdf:RDF"]?.channel;

  if (channel) {
    for (const entry of asArray(channel.item)) {
      const link = canonicalUrl(text(entry.link) || text(entry.guid), source.url);
      const title = truncate(text(entry.title).trim(), 200);
      if (!link || !title) continue;
      items.push({
        externalId: text(entry.guid) || link,
        url: link,
        title,
        summary: truncate(
          stripHtml(text(entry.description) || text(entry["content:encoded"])),
          MAX_SUMMARY_LENGTH
        ),
        author: text(entry.author) || text(entry["dc:creator"]) || undefined,
        publishedAt: text(entry.pubDate) || text(entry["dc:date"]) || undefined
      });
    }
  }

  const atom = doc?.feed;
  if (atom) {
    for (const entry of asArray(atom.entry)) {
      const links = asArray(entry.link);
      const alternate =
        links.find(
          (link) =>
            typeof link === "object" &&
            link !== null &&
            (link as Record<string, unknown>)["@_rel"] === "alternate"
        ) ?? links[0];
      const href =
        (alternate as Record<string, unknown> | undefined)?.["@_href"] ||
        text(entry.id);
      if (!href) continue;
      const link = canonicalUrl(String(href), source.url);
      const title = truncate(text(entry.title).trim(), 200);
      if (!title) continue;
      items.push({
        externalId: text(entry.id) || link,
        url: link,
        title,
        summary: truncate(
          stripHtml(text(entry.summary) || text(entry.content)),
          MAX_SUMMARY_LENGTH
        ),
        author: text((entry.author as Record<string, unknown> | undefined)?.name) || undefined,
        publishedAt: text(entry.updated) || text(entry.published) || undefined
      });
    }
  }

  return items;
}

async function parseJson(response: Response, source: Source): Promise<RawItem[]> {
  const body = (await response.json()) as unknown;
  const config = parseConfig(source);
  const itemsPath = typeof config.itemsPath === "string" ? config.itemsPath : "";
  const list = asArray(
    itemsPath ? getPath(body, itemsPath) : (body as Record<string, unknown>)?.items
  );
  const fields = (config.fields ?? {}) as Record<string, string>;
  const pick = (item: unknown, key: string) =>
    fields[key] ? getPath(item, fields[key]) : undefined;

  return list
    .slice(0, Number(config.maxItems) || MAX_ITEMS_PER_SOURCE)
    .map((item) => {
      const rawUrl = String(pick(item, "url") ?? "");
      const url = canonicalUrl(rawUrl, source.url);
      const title = truncate(String(pick(item, "title") ?? "").trim(), 200);
      return {
        externalId: String(pick(item, "id") ?? url),
        url,
        title,
        summary: truncate(
          stripHtml(String(pick(item, "summary") ?? "")),
          MAX_SUMMARY_LENGTH
        ),
        author: String(pick(item, "author") ?? "") || undefined,
        publishedAt: String(pick(item, "date") ?? "") || undefined
      };
    })
    .filter((item) => item.title && item.url);
}

async function parseHtml(response: Response, source: Source): Promise<RawItem[]> {
  const config = parseConfig(source);
  const base = String(config.baseUrl || source.url);
  const itemSelector = String(config.itemSelector || "article");
  const titleSelector = String(config.titleSelector || "h2");
  const linkSelector = String(config.linkSelector || "a");
  const summarySelector = String(config.summarySelector || "p");
  const items: RawItem[] = [];
  let current: RawItem | null = null;

  const rewriter = new HTMLRewriter()
    .on(itemSelector, {
      element(element: any) {
        current = { externalId: "", url: "", title: "", summary: "" };
        element.onEndTag(() => {
          if (current?.title && current.url) {
            current.externalId = current.externalId || current.url;
            items.push(current);
          }
          current = null;
        });
      }
    })
    .on(`${itemSelector} ${titleSelector}`, {
      text(chunk: any) {
        if (current) current.title += chunk.text;
      }
    })
    .on(`${itemSelector} ${linkSelector}`, {
      element(element: any) {
        if (!current || current.url) return;
        const href = element.getAttribute("href");
        if (!href) return;
        try {
          current.url = canonicalUrl(href, base);
        } catch {
          /* ignore malformed link */
        }
      }
    })
    .on(`${itemSelector} ${summarySelector}`, {
      text(chunk: any) {
        if (current) current.summary += chunk.text;
      }
    });

  await rewriter.transform(response).text();

  return items
    .slice(0, Number(config.maxItems) || MAX_ITEMS_PER_SOURCE)
    .map((item) => ({
      ...item,
      title: truncate(item.title.trim(), 200),
      summary: truncate(stripHtml(item.summary.trim()), MAX_SUMMARY_LENGTH)
    }))
    .filter((item) => item.title && item.url);
}

function assertAllowedUrl(raw: string): void {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("only https sources are allowed");
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".local") ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  ) {
    throw new Error("private hosts are not allowed");
  }
}

async function fetchSource(source: Source): Promise<FetchResult> {
  assertAllowedUrl(source.url);

  const headers: Record<string, string> = {
    "user-agent": USER_AGENT,
    accept:
      source.kind === "rss"
        ? "application/rss+xml, application/atom+xml, application/xml, text/xml"
        : source.kind === "json"
          ? "application/json"
          : "text/html,application/xhtml+xml"
  };
  if (source.etag) headers["if-none-match"] = source.etag;
  if (source.last_modified) headers["if-modified-since"] = source.last_modified;

  const response = await fetch(source.url, {
    headers,
    signal: AbortSignal.timeout(15_000),
    redirect: "follow"
  });

  if (response.status === 304) {
    return {
      items: [],
      etag: source.etag,
      lastModified: source.last_modified
    };
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const items =
    source.kind === "rss"
      ? parseRss(await response.text(), source)
      : source.kind === "json"
        ? await parseJson(response, source)
        : await parseHtml(response, source);

  return {
    items: items.slice(0, MAX_ITEMS_PER_SOURCE),
    etag: response.headers.get("etag"),
    lastModified: response.headers.get("last-modified")
  };
}

async function updateSource(
  env: Env,
  source: Source,
  status: number,
  result: FetchResult | null,
  error?: string
) {
  await env.STATS_DB.prepare(
    `UPDATE sources
     SET last_fetched_at = CURRENT_TIMESTAMP,
         last_status = ?,
         last_error = ?,
         etag = COALESCE(?, etag),
         last_modified = COALESCE(?, last_modified)
     WHERE id = ?`
  )
    .bind(status, error ?? null, result?.etag ?? null, result?.lastModified ?? null, source.id)
    .run();
}

async function run(env: Env) {
  const runResult = await env.STATS_DB.prepare(
    "INSERT INTO fetch_runs DEFAULT VALUES"
  ).run();
  const runId = runResult.meta.last_row_id;

  const sources = await env.STATS_DB.prepare(
    `SELECT id, name, slug, kind, url, config, etag, last_modified
     FROM sources
     WHERE enabled = 1
     ORDER BY id`
  ).all<Source>();

  let inserted = 0;
  let failed = 0;

  for (let offset = 0; offset < sources.results.length; offset += 3) {
    const batch = sources.results.slice(offset, offset + 3);
    await Promise.all(
      batch.map(async (source: Source) => {
        try {
          const result = await fetchSource(source);
          const statements = (result.items || []).map((item) =>
            env.STATS_DB.prepare(
              `INSERT INTO items
                 (source_id, external_id, url, url_key, title, summary, author, published_at, fetched_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(url_key) DO UPDATE SET
                 title = excluded.title,
                 summary = excluded.summary,
                 author = excluded.author,
                 published_at = COALESCE(items.published_at, excluded.published_at),
                 fetched_at = CURRENT_TIMESTAMP`
            ).bind(
              source.id,
              item.externalId,
              item.url,
              item.url,
              truncate(item.title.trim(), 200),
              item.summary,
              item.author ?? null,
              item.publishedAt ?? null
            )
          );

          for (let i = 0; i < statements.length; i += 50) {
            await env.STATS_DB.batch(statements.slice(i, i + 50));
          }
          inserted += statements.length;
          await updateSource(env, source, 200, result);
        } catch (error) {
          failed += 1;
          const message = error instanceof Error ? error.message : "unknown";
          await updateSource(env, source, 0, null, message.slice(0, 500));
        }
      })
    );
  }

  await env.STATS_DB.prepare(
    `UPDATE fetch_runs
     SET finished_at = CURRENT_TIMESTAMP,
         source_count = ?1,
         inserted_count = ?2,
         failed_count = ?3
     WHERE id = ?4`
  )
    .bind(sources.results.length, inserted, failed, runId)
    .run();

  return { sources: sources.results.length, inserted, failed };
}

export default {
  async scheduled(
    _event: any,
    env: Env,
    ctx: any
  ) {
    ctx.waitUntil(run(env));
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({ ok: true });
    }

    if (url.pathname === "/run") {
      const auth = request.headers.get("authorization");
      if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) {
        return new Response("Unauthorized", { status: 401 });
      }
      return Response.json(await run(env));
    }

    return new Response("Not found", { status: 404 });
  }
};
