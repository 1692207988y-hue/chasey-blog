import type { Metadata } from "next";
import { getSearchDocuments } from "@/lib/posts";
import { SearchClient } from "@/components/search-client";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索 Chasey 博客的标题、正文与标签。",
  alternates: { canonical: "/search" }
};

export default function SearchPage() {
  const documents = getSearchDocuments();
  return (
    <div className="container-page max-w-3xl py-14 sm:py-20">
      <header>
        <p className="section-label">Search</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">搜索。</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          支持标题、正文、分类和标签的全文检索，共 {documents.length} 篇文章索引。
        </p>
      </header>
      <div className="mt-8">
        <SearchClient documents={documents} />
      </div>
    </div>
  );
}
