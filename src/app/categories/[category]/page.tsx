import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { getAllCategories, getPostsByCategory } from "@/lib/posts";

export function generateStaticParams() {
  return getAllCategories().map(({ category }) => ({ category: encodeURIComponent(category) }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const category = decodeURIComponent(params.category);
  return {
    title: `分类：${category}`,
    description: `分类 ${category} 下的全部文章。`,
    alternates: { canonical: `/categories/${encodeURIComponent(category)}` }
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = decodeURIComponent(params.category);
  const posts = getPostsByCategory(category);
  if (!posts.length) notFound();

  return (
    <div className="container-page py-14 sm:py-20">
      <header>
        <Link href="/categories" className="font-mono text-[9px] text-faint transition hover:text-ink">← 所有分类</Link>
        <p className="section-label mt-6">Category</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">{category}</h1>
        <p className="mt-4 text-sm text-muted">共 {posts.length} 篇文章。</p>
      </header>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => <PostCard key={post.slug} post={post} />)}
      </div>
    </div>
  );
}
