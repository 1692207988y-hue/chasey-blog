"use client";

import { useEffect, useState } from "react";

interface Item {
  id: number;
  title: string;
  url: string;
  summary: string;
  author: string | null;
  published_at: string | null;
  first_seen_at: string;
  source_name: string;
  source_slug: string;
}

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function AggregatedFeed() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/discover?limit=30", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ items: Item[] }>;
      })
      .then((data) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("暂时无法加载聚合内容。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-line/20 p-8 text-center text-sm text-muted">
        正在加载聚合内容…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-line/20 p-8 text-center text-sm text-muted">
        {error}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line/20 p-8 text-center text-sm leading-7 text-muted">
        暂无聚合内容。配置 `sources` 后，定时抓取会自动填充这里。
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl border border-line/10 bg-surface/40 p-5 transition hover:border-line/25"
        >
          <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] text-faint">
            <span className="text-accent2">{item.source_name}</span>
            {item.published_at ? <span>· {formatDate(item.published_at)}</span> : null}
            {item.author ? <span>· {item.author}</span> : null}
          </div>

          <h2 className="mt-2 font-serif text-xl leading-snug text-ink">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-accent"
            >
              {item.title}
            </a>
          </h2>

          {item.summary ? (
            <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted">
              {item.summary}
            </p>
          ) : null}

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex font-mono text-[9px] text-faint transition hover:text-ink"
          >
            阅读原文 ↗
          </a>
        </article>
      ))}
    </div>
  );
}
