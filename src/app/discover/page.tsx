import type { Metadata } from "next";
import { AggregatedFeed } from "@/components/aggregated-feed";

export const metadata: Metadata = {
  title: "发现",
  description: "来自 RSS、公开 API 与授权网页的内容聚合，只保留标题、摘要和原文链接。",
  alternates: { canonical: "/discover" }
};

export default function DiscoverPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="section-label">Discover</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">
          发现。
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          这里聚合来自 RSS、公开 API 和授权网页的内容。只保留标题、摘要与原文链接，阅读全文请前往来源网站。
        </p>
      </header>

      <div className="mt-10">
        <AggregatedFeed />
      </div>
    </div>
  );
}
