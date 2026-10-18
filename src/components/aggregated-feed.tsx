"use client";

import { useEffect, useMemo, useState } from "react";

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

interface Source {
  slug: string;
  name: string;
  count: number;
}

interface FeedResponse {
  items: Item[];
  sources: Source[];
  total: number;
  hasMore: boolean;
}

const PAGE_SIZE = 12;

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function cleanSummary(value: string) {
  const cleaned = value
    .replace(/Article URL:\s*\S+/gi, " ")
    .replace(/Comments URL:\s*\S+/gi, " ")
    .replace(/Points:\s*\d+/gi, " ")
    .replace(/#\s*Comments:\s*\d+/gi, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 24 ? cleaned : "";
}

function hostname(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={`animate-pulse rounded-[26px] border border-line/10 bg-surface/40 ${
        featured ? "p-7 sm:p-9" : "p-6"
      }`}
    >
      <div className="h-2 w-24 rounded-full bg-line/15" />
      <div className={`mt-5 h-6 rounded-lg bg-line/15 ${featured ? "w-4/5" : "w-11/12"}`} />
      <div className="mt-3 h-6 w-2/3 rounded-lg bg-line/10" />
      <div className="mt-6 h-3 w-full rounded-full bg-line/10" />
      <div className="mt-2 h-3 w-4/5 rounded-full bg-line/10" />
      <div className="mt-7 h-2 w-16 rounded-full bg-line/10" />
    </div>
  );
}

export function AggregatedFeed() {
  const [items, setItems] = useState<Item[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [activeSource, setActiveSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setItems([]);
    setSources([]);

    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: "0" });
    if (activeSource) params.set("source", activeSource);

    fetch(`/api/discover?${params.toString()}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<FeedResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items ?? []);
        setSources(data.sources ?? []);
        setTotal(data.total ?? 0);
        setHasMore(Boolean(data.hasMore));
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
  }, [activeSource]);

  const featured = items[0];
  const rest = useMemo(() => items.slice(1), [items]);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(items.length)
      });
      if (activeSource) params.set("source", activeSource);
      const res = await fetch(`/api/discover?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as FeedResponse;
      setItems((current) => [...current, ...(data.items ?? [])]);
      setHasMore(Boolean(data.hasMore));
      setTotal(data.total ?? 0);
    } catch {
      setError("加载更多失败，请稍后重试。");
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <SkeletonCard featured />
        </div>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error && !items.length) {
    return (
      <div className="rounded-[26px] border border-dashed border-line/20 bg-surface/30 p-10 text-center text-sm leading-7 text-muted">
        {error}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-[26px] border border-dashed border-line/20 bg-surface/30 p-10 text-center text-sm leading-7 text-muted">
        <p className="font-serif text-2xl text-ink">信号还在路上。</p>
        <p className="mt-3">配置 D1 的 `sources` 后，聚合内容会出现在这里。</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-y border-line/10 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSource("")}
            className={`rounded-full px-3 py-1.5 font-mono text-[9px] transition ${
              activeSource === ""
                ? "bg-ink text-paper"
                : "border border-line/15 text-muted hover:border-line/30 hover:text-ink"
            }`}
          >
            全部 <span className="opacity-60">{total}</span>
          </button>
          {sources.map((source) => (
            <button
              key={source.slug}
              type="button"
              onClick={() => setActiveSource(source.slug)}
              className={`rounded-full px-3 py-1.5 font-mono text-[9px] transition ${
                activeSource === source.slug
                  ? "bg-ink text-paper"
                  : "border border-line/15 text-muted hover:border-line/30 hover:text-ink"
              }`}
            >
              {source.name} <span className="opacity-60">{source.count}</span>
            </button>
          ))}
        </div>
        <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-faint">
          {activeSource ? "Filtered stream" : "Live signal"}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {featured ? (
          <article className="group relative overflow-hidden rounded-[28px] border border-line/12 bg-gradient-to-br from-surface/80 via-surface/45 to-accent/5 p-6 transition hover:border-line/25 sm:p-9 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] text-faint">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-accent2">
                <span className="h-1 w-1 rounded-full bg-accent2" aria-hidden="true" />
                Latest signal
              </span>
              <span>{featured.source_name}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={featured.published_at || featured.first_seen_at}>
                {formatDate(featured.published_at || featured.first_seen_at)}
              </time>
            </div>

            <h2 className="mt-5 max-w-3xl font-serif text-3xl leading-[1.18] tracking-[-0.035em] text-ink sm:text-4xl">
              <a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition group-hover:text-accent"
              >
                {featured.title}
              </a>
            </h2>

            {cleanSummary(featured.summary) ? (
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                {cleanSummary(featured.summary)}
              </p>
            ) : null}

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-faint">
                {hostname(featured.url)}
              </span>
              <a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[11px] text-paper transition hover:-translate-y-0.5"
              >
                阅读原文 <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ) : null}

        {rest.map((item) => {
          const summary = cleanSummary(item.summary);
          return (
            <article
              key={item.id}
              className="group flex min-h-[220px] flex-col justify-between rounded-[24px] border border-line/10 bg-surface/35 p-5 transition hover:-translate-y-0.5 hover:border-line/25 hover:bg-surface/60 sm:p-6"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[8px] text-faint">
                  <span className="rounded-full border border-line/12 px-2 py-0.5 text-accent2">
                    {item.source_name}
                  </span>
                  <time dateTime={item.published_at || item.first_seen_at}>
                    {formatDate(item.published_at || item.first_seen_at)}
                  </time>
                  {item.author ? <span>· {item.author}</span> : null}
                </div>

                <h2 className="mt-4 font-serif text-xl leading-snug tracking-[-0.02em] text-ink">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition group-hover:text-accent"
                  >
                    {item.title}
                  </a>
                </h2>

                {summary ? (
                  <p className="mt-3 line-clamp-2 text-xs leading-6 text-muted">{summary}</p>
                ) : null}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line/10 pt-3">
                <span className="truncate font-mono text-[8px] text-faint">{hostname(item.url)}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 shrink-0 font-mono text-[9px] text-faint transition group-hover:text-ink"
                >
                  阅读原文 ↗
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full border border-line/20 px-6 py-3 font-mono text-[9px] uppercase tracking-[0.1em] text-muted transition hover:border-line/40 hover:text-ink disabled:opacity-50"
          >
            {loadingMore ? "正在接收…" : "加载更多信号"}
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-5 text-center text-xs text-muted">{error}</p> : null}
    </div>
  );
}
