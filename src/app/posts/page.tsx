import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getAllPosts, getAllCategories } from "@/lib/posts";

export const metadata: Metadata = {
  title: "文章",
  description: "Chasey 的全部文章：工程、设计、生活与阅读。",
  alternates: { canonical: "/posts" }
};

export default function PostsPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <div className="container-page py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="section-label">All posts</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">文章。</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          目前共 {posts.length} 篇。写代码、设计、阅读和偶尔的宇宙巡逻记录。
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.category}
            href={`/categories/${encodeURIComponent(category.category)}`}
            className="rounded-full border border-line/12 px-3 py-1.5 font-mono text-[9px] text-faint transition hover:border-line/30 hover:text-ink"
          >
            {category.category} · {category.count}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
