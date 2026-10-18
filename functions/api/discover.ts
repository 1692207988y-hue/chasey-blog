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

interface SourceRow {
  slug: string;
  name: string;
  count: number;
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}) {
  const url = new URL(context.request.url);
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit")) || 12, 1),
    30
  );
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);
  const source = url.searchParams.get("source");

  const where = ["i.hidden = 0"];
  const params: unknown[] = [];

  if (source) {
    where.push("s.slug = ?");
    params.push(source);
  }

  try {
    const totalRow = await context.env.STATS_DB.prepare(
      `SELECT COUNT(*) AS total
       FROM items i
       JOIN sources s ON s.id = i.source_id
       WHERE ${where.join(" AND ")}`
    )
      .bind(...params)
      .first<{ total: number }>();

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
       LIMIT ? OFFSET ?`
    )
      .bind(...params, limit, offset)
      .all<DiscoverRow>();

    const sources = await context.env.STATS_DB.prepare(
      `SELECT s.slug, s.name, COUNT(i.id) AS count
       FROM sources s
       LEFT JOIN items i ON i.source_id = s.id AND i.hidden = 0
       WHERE s.enabled = 1
       GROUP BY s.id
       ORDER BY count DESC, s.name ASC`
    ).all<SourceRow>();

    const total = Number(totalRow?.total) || 0;

    return Response.json(
      {
        items: rows.results,
        sources: sources.results,
        total,
        hasMore: offset + rows.results.length < total
      },
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
      { items: [], sources: [], total: 0, hasMore: false, error: "aggregator_not_initialized" },
      {
        headers: {
          "cache-control": "no-store",
          "content-type": "application/json; charset=utf-8"
        }
      }
    );
  }
}
