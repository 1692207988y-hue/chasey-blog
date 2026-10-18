import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { formatDate, tagHref } from "@/lib/utils";

export function CoverArt({
  variant,
  className = "",
  compact = false
}: {
  variant: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`cover-art cover-${variant} ${compact ? "cover-art--compact" : ""} ${className}`} aria-hidden="true">
      <span className="cover-orbit cover-orbit--one" />
      <span className="cover-orbit cover-orbit--two" />
      <span className="cover-star cover-star--one" />
      <span className="cover-star cover-star--two" />
      <span className="cover-label">{variant.toUpperCase()}</span>
    </div>
  );
}

export function PostCard({ post, featured = false }: { post: PostMeta; featured?: boolean }) {
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[22px] border border-line/12 bg-surface/60 transition duration-300 hover:-translate-y-1 hover:border-line/25 hover:shadow-card ${
        featured ? "lg:col-span-2" : ""
      }`}
    >
      <Link href={`/posts/${post.slug}`} className="block" aria-label={post.title}>
        <CoverArt variant={post.cover} className={featured ? "h-56 sm:h-64" : "h-40"} />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-faint">
          <span className="text-accent">{post.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} 分钟</span>
        </div>
        <h3 className={`mt-3 font-serif leading-snug tracking-tight text-ink ${featured ? "text-2xl sm:text-3xl" : "text-xl"}`}>
          <Link href={`/posts/${post.slug}`} className="transition group-hover:text-accent">
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-2 text-[13px] leading-7 text-muted">{post.description}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <Link
              key={tag}
              href={tagHref(tag)}
              className="rounded-full border border-line/12 px-2.5 py-1 font-mono text-[8px] text-faint transition hover:border-line/30 hover:text-ink"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
