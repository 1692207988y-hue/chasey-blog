"use client";

import Link from "next/link";

interface PopularPost {
  slug: string;
  title: string;
  category: string;
  readingMinutes: number;
  views: number;
  likes: number;
}

export function PopularPosts({ fallback }: { fallback: PopularPost[] }) {
  const posts = fallback;

  return (
    <div className="rounded-[24px] border border-line/12 bg-surface/45 p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-accent2">Popular · 热门</p>
        <span className="font-mono text-[8px] text-faint">按互动</span>
      </div>
      <ol className="mt-3 divide-y divide-line/10">
        {posts.map((post, index) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`} className="group flex gap-3 py-3">
              <span className="font-mono text-[10px] text-accent/80">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="block truncate font-serif text-sm text-ink transition group-hover:text-accent">{post.title}</span>
                <span className="mt-1 block font-mono text-[8px] text-faint">
                  {post.category} · {post.views} 阅读 · {post.likes} 赞
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
