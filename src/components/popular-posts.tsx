"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface PopularPost {
  slug: string;
  title: string;
  category: string;
  readingMinutes: number;
  views: number;
  likes: number;
}

interface PopularStat {
  slug: string;
  views: number;
  likes: number;
}

export function PopularPosts({ fallback }: { fallback: PopularPost[] }) {
  const [posts, setPosts] = useState<PopularPost[]>(fallback.slice(0, 4));

  useEffect(() => {
    let cancelled = false;
    fetch("/api/popular", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PopularStat[] | null) => {
        if (cancelled || !Array.isArray(data) || !data.length) return;
        const bySlug = new Map(fallback.map((post) => [post.slug, post]));
        const ranked = data
          .map((stat) => {
            const post = bySlug.get(stat.slug);
            return post ? { ...post, views: stat.views, likes: stat.likes } : null;
          })
          .filter(Boolean) as PopularPost[];
        const seen = new Set(ranked.map((post) => post.slug));
        const rest = fallback.filter((post) => !seen.has(post.slug));
        setPosts([...ranked, ...rest].slice(0, 4));
      })
      .catch(() => {
        /* keep curated fallback */
      });
    return () => {
      cancelled = true;
    };
  }, [fallback]);

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
