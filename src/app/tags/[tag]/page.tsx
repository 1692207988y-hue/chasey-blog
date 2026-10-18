import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { getAllTags, getPostsByTag } from "@/lib/posts";

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export function generateMetadata({ params }: { params: { tag: string } }): Metadata {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `标签：${tag}`,
    description: `标签 ${tag} 下的全部文章。`,
    alternates: { canonical: `/tags/${encodeURIComponent(tag)}` }
  };
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const posts = getPostsByTag(tag);
  if (!posts.length) notFound();

  return (
    <div className="container-page py-14 sm:py-20">
      <header>
        <Link href="/tags" className="font-mono text-[9px] text-faint transition hover:text-ink">← 所有标签</Link>
        <p className="section-label mt-6">Tag</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">#{tag}</h1>
        <p className="mt-4 text-sm text-muted">共 {posts.length} 篇文章。</p>
      </header>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => <PostCard key={post.slug} post={post} />)}
      </div>
    </div>
  );
}
