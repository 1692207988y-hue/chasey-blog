interface Env {
  STATS_DB?: D1Database;
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

function validVisitor(visitor: unknown): visitor is string {
  return typeof visitor === "string" && /^[A-Za-z0-9_-]{8,80}$/.test(visitor);
}

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

async function counts(db: D1Database, slug: string): Promise<Stats> {
  const row = await db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM post_views WHERE slug = ?1) AS views,
         (SELECT COUNT(*) FROM post_likes WHERE slug = ?1) AS likes`
    )
    .bind(slug)
    .first<Stats>();
  return {
    views: Math.max(0, Number(row?.views) || 0),
    likes: Math.max(0, Number(row?.likes) || 0)
  };
}

export async function onRequestGet(context: PagesContext) {
  const slug = context.params.slug;
  if (!validSlug(slug)) return json({ error: "invalid_slug" }, 400);
  if (!context.env.STATS_DB) return json({ error: "stats_not_configured" }, 503);
  return json(await counts(context.env.STATS_DB, slug));
}

export async function onRequestPost(context: PagesContext) {
  const db = context.env.STATS_DB;
  const slug = context.params.slug;
  if (!validSlug(slug)) return json({ error: "invalid_slug" }, 400);
  if (!db) return json({ error: "stats_not_configured" }, 503);

  let body: { action?: string; visitor?: string } = {};
  try {
    body = (await context.request.json()) as { action?: string; visitor?: string };
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  if (!validVisitor(body.visitor)) return json({ error: "invalid_visitor" }, 400);
  const visitor = body.visitor;
  const action = body.action;

  if (action === "view") {
    await db
      .prepare("INSERT OR IGNORE INTO post_views (slug, visitor, day) VALUES (?1, ?2, ?3)")
      .bind(slug, visitor, utcDay())
      .run();
  } else if (action === "like") {
    await db
      .prepare("INSERT OR IGNORE INTO post_likes (slug, visitor) VALUES (?1, ?2)")
      .bind(slug, visitor)
      .run();
  } else if (action === "unlike") {
    await db
      .prepare("DELETE FROM post_likes WHERE slug = ?1 AND visitor = ?2")
      .bind(slug, visitor)
      .run();
  } else {
    return json({ error: "invalid_action" }, 400);
  }

  return json(await counts(db, slug));
}
