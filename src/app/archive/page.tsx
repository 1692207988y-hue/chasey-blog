import type { Metadata } from "next";
import Link from "next/link";
import { getArchiveGroups } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "归档",
  description: "按时间浏览 Chasey 的全部文章。",
  alternates: { canonical: "/archive" }
};

export default function ArchivePage() {
  const groups = getArchiveGroups();
  const total = groups.reduce((sum, group) => sum + group.posts.length, 0);

  return (
    <div className="container-page py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="section-label">Archive</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">归档。</h1>
        <p className="mt-4 text-sm leading-7 text-muted">共 {total} 篇文章，按年份排列。</p>
      </header>

      <div className="mt-12 space-y-14">
        {groups.map((group) => (
          <section key={group.year} className="grid gap-6 md:grid-cols-[120px_1fr]">
            <h2 className="font-serif text-5xl font-semibold tracking-tight text-line/30 md:sticky md:top-28 md:self-start">
              {group.year}
            </h2>
            <div className="border-t border-line/10">
              {group.posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  className="group flex flex-col gap-1 border-b border-line/10 py-5 transition hover:border-line/25 sm:flex-row sm:items-baseline sm:gap-5"
                >
                  <time className="w-24 shrink-0 font-mono text-[9px] text-faint" dateTime={post.date}>
                    {post.date.slice(5).replace("-", ".")}
                  </time>
                  <span className="font-serif text-lg text-ink transition group-hover:text-accent">{post.title}</span>
                  <span className="ml-auto font-mono text-[9px] text-faint">{post.category}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-14 font-mono text-[9px] text-faint">
        最后更新：{formatDate(new Date().toISOString().slice(0, 10))}
      </p>
    </div>
  );
}
