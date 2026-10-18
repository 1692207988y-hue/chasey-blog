import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { CoverArt } from "@/components/post-card";
import { PostToc, PostTocMobile } from "@/components/post-toc";
import { PostStats } from "@/components/post-stats";
import { Comments } from "@/components/comments";
import { JsonLd } from "@/components/json-ld";
import { mdxComponents } from "@/components/mdx-components";
import {
  extractToc,
  getAdjacentPosts,
  getPostBySlug,
  getRelatedPosts,
  getAllPosts
} from "@/lib/posts";
import { formatDate, tagHref } from "@/lib/utils";
import { postJsonLd } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "文章不存在" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/posts/${post.slug}` },
    authors: [{ name: "Chasey" }],
    keywords: [post.category, ...post.tags],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: absoluteUrl(`/posts/${post.slug}`),
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: ["Chasey"],
      tags: post.tags,
      images: [{ url: "/og.png", width: 1200, height: 630 }]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og.png"]
    }
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const toc = extractToc(post.content);
  const { previous, next } = getAdjacentPosts(post.slug);
  const related = getRelatedPosts(post, 3);

  return (
    <>
      <JsonLd data={postJsonLd(post)} />
      <article className="container-page py-10 sm:py-16">
        <div className="mb-8 flex flex-wrap items-center gap-2 font-mono text-[9px] text-faint">
          <Link href="/posts" className="transition hover:text-ink">文章</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/categories/${encodeURIComponent(post.category)}`} className="transition hover:text-ink">
            {post.category}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-muted">{post.slug}</span>
        </div>

        <header className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-faint">
            <span className="text-accent">{post.category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} 分钟阅读</span>
          </div>
          <h1 className="mt-4 font-serif text-4xl leading-[1.18] tracking-[-0.04em] text-ink sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-8 text-muted">{post.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={tagHref(tag)}
                className="rounded-full border border-line/12 px-3 py-1 font-mono text-[9px] text-faint transition hover:border-line/30 hover:text-ink"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </header>

        <div className="mt-10 overflow-hidden rounded-[26px] border border-line/12">
          <CoverArt variant={post.cover} className="h-56 sm:h-72" />
        </div>

        <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,760px)_220px] xl:items-start xl:justify-between">
          <div>
            <PostTocMobile items={toc} />
            <div className="prose prose-neutral max-w-none dark:prose-invert">
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypeSlug, [rehypeHighlight, { detect: false }]]
                  }
                }}
              />
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line/10 pt-6">
              <PostStats slug={post.slug} />
              <div className="flex items-center gap-3 font-mono text-[9px] text-faint">
                <span>{post.wordCount.toLocaleString("zh-CN")} 字</span>
                <span>·</span>
                <span>{post.readingMinutes} 分钟</span>
              </div>
            </div>

            <Comments />

            <nav className="mt-12 grid gap-3 border-t border-line/10 pt-8 sm:grid-cols-2" aria-label="文章翻页">
              {previous ? (
                <Link href={`/posts/${previous.slug}`} className="group rounded-2xl border border-line/10 p-5 transition hover:border-line/25">
                  <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-faint">← 上一篇</p>
                  <p className="mt-2 font-serif text-lg text-ink transition group-hover:text-accent">{previous.title}</p>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link href={`/posts/${next.slug}`} className="group rounded-2xl border border-line/10 p-5 text-right transition hover:border-line/25">
                  <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-faint">下一篇 →</p>
                  <p className="mt-2 font-serif text-lg text-ink transition group-hover:text-accent">{next.title}</p>
                </Link>
              ) : null}
            </nav>
          </div>

          <aside className="sticky top-28 hidden xl:block">
            <PostToc items={toc} />
            <div className="mt-8 border-t border-line/10 pt-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">Meta</p>
              <dl className="mt-3 space-y-2 text-[11px] text-muted">
                <div className="flex justify-between gap-3">
                  <dt>发布</dt>
                  <dd className="font-mono text-faint">{post.date}</dd>
                </div>
                {post.updated ? (
                  <div className="flex justify-between gap-3">
                    <dt>更新</dt>
                    <dd className="font-mono text-faint">{post.updated}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3">
                  <dt>字数</dt>
                  <dd className="font-mono text-faint">{post.wordCount.toLocaleString("zh-CN")}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <section className="mt-16 border-t border-line/10 pt-10">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="section-label">Related</p>
                <h2 className="mt-3 font-serif text-2xl text-ink">延伸阅读</h2>
              </div>
              <Link href="/posts" className="font-mono text-[9px] text-faint transition hover:text-ink">全部文章 →</Link>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.slug} href={`/posts/${item.slug}`} className="group rounded-2xl border border-line/10 p-5 transition hover:border-line/25 hover:bg-surface">
                  <p className="font-mono text-[9px] text-faint">{item.category}</p>
                  <p className="mt-2 font-serif text-lg leading-snug text-ink transition group-hover:text-accent">{item.title}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </>
  );
}
