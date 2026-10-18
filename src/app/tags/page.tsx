import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览 Chasey 的文章。",
  alternates: { canonical: "/tags" }
};

export default function TagsPage() {
  const tags = getAllTags();
  return (
    <div className="container-page py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="section-label">Tags</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">标签。</h1>
        <p className="mt-4 text-sm leading-7 text-muted">一些我会反复写到的词。</p>
      </header>
      <div className="mt-10 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.tag}
            href={`/tags/${encodeURIComponent(tag.tag)}`}
            className="group inline-flex items-center gap-2 rounded-full border border-line/12 px-4 py-2 text-sm text-muted transition hover:border-line/30 hover:bg-surface hover:text-ink"
          >
            #{tag.tag}
            <span className="font-mono text-[9px] text-faint group-hover:text-muted">{tag.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
