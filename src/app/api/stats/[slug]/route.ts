import { NextRequest } from "next/server";
import { getPostBySlug } from "@/lib/posts";
import { getStats, incrementViews, toggleLike } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!getPostBySlug(params.slug)) return json({ error: "not_found" }, 404);
  const stats = await getStats(params.slug);
  return json(stats);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!getPostBySlug(params.slug)) return json({ error: "not_found" }, 404);

  let body: { action?: string } = {};
  try {
    body = (await request.json()) as { action?: string };
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  const action = body.action;
  if (action !== "view" && action !== "like" && action !== "unlike") {
    return json({ error: "invalid_action" }, 400);
  }

  try {
    const stats = action === "view"
      ? await incrementViews(params.slug)
      : await toggleLike(params.slug, action);
    return json(stats);
  } catch {
    return json({ error: "stats_unavailable" }, 503);
  }
}
