interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

interface Env {
  STATS_KV?: KVNamespaceLike;
}

interface PagesContext {
  request: Request;
  params: Record<string, string>;
  env: Env;
}

interface Stats {
  views: number;
  likes: number;
}

const EMPTY: Stats = { views: 0, likes: 0 };
const memory = new Map<string, Stats>();

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0"
    }
  });
}

function validSlug(slug: string) {
  return /^[a-z0-9][a-z0-9-]{0,120}$/i.test(slug);
}

async function readStats(env: Env, slug: string): Promise<Stats> {
  if (!env.STATS_KV) return memory.get(slug) || EMPTY;
  const raw = await env.STATS_KV.get(`stats:${slug}`);
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<Stats>;
    return {
      views: Math.max(0, Number(parsed.views) || 0),
      likes: Math.max(0, Number(parsed.likes) || 0)
    };
  } catch {
    return EMPTY;
  }
}

async function writeStats(env: Env, slug: string, stats: Stats) {
  memory.set(slug, stats);
  if (env.STATS_KV) await env.STATS_KV.put(`stats:${slug}`, JSON.stringify(stats));
}

export async function onRequestGet(context: PagesContext) {
  const slug = context.params.slug;
  if (!validSlug(slug)) return json({ error: "invalid_slug" }, 400);
  return json(await readStats(context.env, slug));
}

export async function onRequestPost(context: PagesContext) {
  const slug = context.params.slug;
  if (!validSlug(slug)) return json({ error: "invalid_slug" }, 400);

  let body: { action?: string } = {};
  try {
    body = (await context.request.json()) as { action?: string };
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  const action = body.action;
  if (action !== "view" && action !== "like" && action !== "unlike") {
    return json({ error: "invalid_action" }, 400);
  }

  const stats = await readStats(context.env, slug);
  if (action === "view") stats.views += 1;
  if (action === "like") stats.likes += 1;
  if (action === "unlike") stats.likes = Math.max(0, stats.likes - 1);
  await writeStats(context.env, slug, stats);
  return json(stats);
}
