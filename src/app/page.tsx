import Link from "next/link";
import type { Metadata } from "next";
import { PostCard, CoverArt } from "@/components/post-card";
import { PopularPosts } from "@/components/popular-posts";
import { getLatestPosts, getPinnedPosts, getAllCategories } from "@/lib/posts";
import { getDailyQuote, getGitHubStats } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "Chasey · 个人博客" },
  description: "Chasey 的个人博客：记录代码、阅读、设计与在太阳系里的日常。",
  alternates: { canonical: "/" }
};

export default async function HomePage() {
  const [quote, github] = await Promise.all([getDailyQuote(), getGitHubStats()]);
  const pinned = getPinnedPosts()[0];
  const latest = getLatestPosts(7).filter((post) => post.slug !== pinned?.slug).slice(0, 6);
  const categories = getAllCategories();

  return (
    <>
      <section className="relative overflow-hidden border-b border-line/10">
        <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line/15 bg-surface/60 px-3 py-1.5 font-mono text-[9px] tracking-[0.08em] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent2 shadow-[0_0_10px_rgb(var(--accent-2))]" />
              河海大学大二在读 · 兼职宇宙超人
            </p>
            <h1 className="mt-6 max-w-3xl font-serif text-[clamp(2.7rem,6.5vw,5.2rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-ink">
              把好奇心
              <br />
              <span className="bg-gradient-to-r from-accent via-accent2 to-accent bg-clip-text text-transparent">写下来。</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-8 text-muted">
              白天在教室和图书馆之间穿梭，晚上在银河系巡逻，偶尔处理一些地球级别的 Bug。
              这里放一些关于代码、设计、阅读和生活的长文。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/posts" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper transition hover:-translate-y-0.5">
                开始阅读
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/about" className="inline-flex h-11 items-center rounded-full border border-line/20 px-5 text-sm text-muted transition hover:border-line/35 hover:text-ink">
                关于我
              </Link>
              <Link href="/search" className="inline-flex h-11 items-center rounded-full border border-line/10 px-5 text-sm text-muted transition hover:border-line/25 hover:text-ink">
                搜索文章
              </Link>
            </div>
          </div>

          <aside className="grid gap-3">
            <div className="rounded-[24px] border border-line/12 bg-surface/60 p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-accent2">Daily signal</p>
              <p className="mt-3 font-serif text-xl leading-8 text-ink">「{quote.text}」</p>
              <p className="mt-3 font-mono text-[9px] text-faint">— {quote.from}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[20px] border border-line/12 bg-surface/40 p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">Articles</p>
                <p className="mt-2 font-serif text-2xl text-ink">{getLatestPosts(100).length}</p>
              </div>
              <div className="rounded-[20px] border border-line/12 bg-surface/40 p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">GitHub</p>
                <p className="mt-2 font-serif text-2xl text-ink">
                  {github ? github.stars : "—"}
                </p>
                <p className="mt-1 text-[10px] text-faint">{github ? "repo stars" : "等待连接"}</p>
              </div>
            </div>
            <PopularPosts
              fallback={getLatestPosts(100).map((post) => ({
                slug: post.slug,
                title: post.title,
                category: post.category,
                readingMinutes: post.readingMinutes,
                views: 0,
                likes: 0
              }))}
            />
          </aside>
        </div>
      </section>

      {pinned ? (
        <section className="container-page py-14 sm:py-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Pinned · 置顶</p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight text-ink">先读这篇。</h2>
            </div>
            <Link href="/posts" className="hidden font-mono text-[9px] uppercase tracking-[0.08em] text-faint transition hover:text-ink sm:block">
              全部文章 →
            </Link>
          </div>
          <Link
            href={`/posts/${pinned.slug}`}
            className="group grid overflow-hidden rounded-[26px] border border-line/12 bg-surface/60 transition hover:-translate-y-1 hover:border-line/25 hover:shadow-card lg:grid-cols-[1.05fr_1fr]"
          >
            <CoverArt variant={pinned.cover} className="min-h-[220px] lg:min-h-full" />
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-faint">
                <span className="text-accent">{pinned.category}</span>
                <span>·</span>
                <time dateTime={pinned.date}>{formatDate(pinned.date)}</time>
                <span>·</span>
                <span>{pinned.readingMinutes} 分钟</span>
              </div>
              <h3 className="mt-4 font-serif text-2xl leading-snug tracking-tight text-ink transition group-hover:text-accent sm:text-3xl">
                {pinned.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted">{pinned.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-faint">
                阅读全文 <span className="transition group-hover:translate-x-1" aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        </section>
      ) : null}

      <section className="container-page py-14 sm:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Latest · 最新</p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-ink">最近写的。</h2>
          </div>
          <Link href="/archive" className="font-mono text-[9px] uppercase tracking-[0.08em] text-faint transition hover:text-ink">
            按时间归档 →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="border-y border-line/10 bg-surface/30">
        <div className="container-page grid gap-8 py-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="section-label">Browse · 主题</p>
            <h2 className="mt-3 font-serif text-2xl tracking-tight text-ink">按分类找。</h2>
            <p className="mt-3 max-w-xs text-xs leading-6 text-muted">
              文章被整理成工程、设计、生活三个长期方向，不追热点，只记录能被反复阅读的东西。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.category}
                href={`/categories/${encodeURIComponent(category.category)}`}
                className="flex items-center justify-between rounded-2xl border border-line/10 px-5 py-4 text-sm text-muted transition hover:border-line/25 hover:bg-surface hover:text-ink"
              >
                <span>{category.category}</span>
                <span className="font-mono text-[9px] text-faint">{category.count} 篇</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[26px] border border-line/12 bg-surface/50 p-6 sm:p-8">
            <p className="section-label">Now · 现在</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight text-ink">
              正在学习如何把想法做成可以长期维护的东西。
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
              这个博客是一个长期项目。它不追求每天更新，只希望每次更新都值得被保存下来。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Next.js", "TypeScript", "Canvas", "阅读", "宇宙"].map((item) => (
                <span key={item} className="rounded-full border border-line/12 px-3 py-1 font-mono text-[9px] text-faint">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[26px] border border-line/12 bg-gradient-to-br from-accent/10 via-surface/40 to-accent2/10 p-6 sm:p-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-accent">RSS</p>
            <p className="mt-3 font-serif text-2xl leading-snug text-ink">不想错过更新？</p>
            <p className="mt-2 text-xs leading-6 text-muted">订阅 RSS，在你的阅读器里安静地等新文章。</p>
            <div className="mt-5 flex gap-2">
              <Link href="/rss.xml" className="rounded-full bg-ink px-4 py-2 text-xs text-paper transition hover:-translate-y-0.5">
                订阅 RSS
              </Link>
              <Link href="/about" className="rounded-full border border-line/20 px-4 py-2 text-xs text-muted transition hover:text-ink">
                关于我
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
