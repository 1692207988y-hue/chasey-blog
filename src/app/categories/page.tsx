import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories } from "@/lib/posts";

export const metadata: Metadata = {
  title: "分类",
  description: "按分类浏览 Chasey 的文章。",
  alternates: { canonical: "/categories" }
};

export default function CategoriesPage() {
  const categories = getAllCategories();
  return (
    <div className="container-page py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="section-label">Categories</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">分类。</h1>
        <p className="mt-4 text-sm leading-7 text-muted">长期写作的几个方向。</p>
      </header>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.category}
            href={`/categories/${encodeURIComponent(category.category)}`}
            className="group flex flex-col justify-between rounded-3xl border border-line/12 bg-surface/50 p-6 transition hover:-translate-y-1 hover:border-line/25 hover:shadow-card"
          >
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-accent2">{category.count} articles</span>
              <h2 className="mt-4 font-serif text-3xl text-ink transition group-hover:text-accent">{category.category}</h2>
            </div>
            <span className="mt-8 font-mono text-[9px] text-faint">浏览 →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
