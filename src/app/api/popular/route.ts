import { getAllPosts } from "@/lib/posts";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const posts = getAllPosts();
  const withStats = await Promise.all(
    posts.map(async (post) => {
      const stats = await getStats(post.slug);
      return {
        slug: post.slug,
        title: post.title,
        category: post.category,
        readingMinutes: post.readingMinutes,
        score: stats.views + stats.likes * 4 + (post.pinned ? 3 : 0) + (post.featured ? 1 : 0),
        views: stats.views,
        likes: stats.likes
      };
    })
  );

  return Response.json(
    withStats.sort((a, b) => b.score - a.score || (a.slug < b.slug ? -1 : 1)).slice(0, 4),
    { headers: { "Cache-Control": "no-store" } }
  );
}
