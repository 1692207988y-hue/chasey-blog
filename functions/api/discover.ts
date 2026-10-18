interface Env {
  STATS_DB: D1Database;
}

interface DiscoverRow {
  id: number;
  title: string;
  url: string;
  summary: string;
  author: string | null;
  published_at: string | null;
  first_seen_at: string;
  source_name: string;
  source_slug: string;
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}) {
  const url = new URL(context.request.url);
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit")) || 20, 1),
    50
  );
  const source = url.searchParams.get("source");

  const where = ["i.hidden = 0"];
  const params: unknown[] = [];

  if (source) {
    where.push("s.slug = ?");
    params.push(source);
  }
  params.push(limit);

  try {
    const rows = await context.env.STATS_DB.prepare(
      `SELECT
         i.id, i.title, i.url, i.summary, i.author,
         i.published_at, i.first_seen_at,
         s.name AS source_name,
         s.slug AS source_slug
       FROM items i
       JOIN sources s ON s.id = i.source_id
       WHERE ${where.join(" AND ")}
       ORDER BY COALESCE(i.published_at, i.first_seen_at) DESC
       LIMIT ?`
    )
      .bind(...params)
      .all<DiscoverRow>();

    return Response.json(
      { items: rows.results },
      {
        headers: {
          "cache-control": "public, max-age=300",
          "content-type": "application/json; charset=utf-8"
        }
      }
    );
  } catch {
    // The page stays useful before the content migration runs.
    return Response.json(
      { items: [], error: "aggregator_not_initialized" },
      {
        headers: {
          "cache-control": "no-store",
          "content-type": "application/json; charset=utf-8"
        }
      }
    );
  }
}
