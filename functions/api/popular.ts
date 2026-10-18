interface Env {
  STATS_DB?: D1Database;
}

interface PagesContext {
  env: Env;
}

interface PopularRow {
  slug: string;
  views: number;
  likes: number;
}

export async function onRequestGet(context: PagesContext) {
  const db = context.env.STATS_DB;
  if (!db) {
    return new Response(JSON.stringify([]), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store, max-age=0"
      }
    });
  }

  const rows = await db
    .prepare(
      `SELECT s.slug AS slug,
              (SELECT COUNT(*) FROM post_views v WHERE v.slug = s.slug) AS views,
              (SELECT COUNT(*) FROM post_likes l WHERE l.slug = s.slug) AS likes
       FROM (SELECT slug FROM post_views UNION SELECT slug FROM post_likes) s
       ORDER BY (views * 1.0 + likes * 4.0) DESC, slug ASC
       LIMIT 4`
    )
    .all<PopularRow>();

  return new Response(JSON.stringify(rows.results || []), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0"
    }
  });
}
