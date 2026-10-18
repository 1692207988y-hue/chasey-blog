"use client";

import { useEffect, useState } from "react";

interface Stats {
  views: number;
  likes: number;
}

function formatCount(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

function getVisitorId() {
  const key = "chasey:visitor-id";
  try {
    const existing = localStorage.getItem(key);
    if (existing && /^[A-Za-z0-9_-]{8,80}$/.test(existing)) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(key, id);
    return id;
  } catch {
    return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
  }
}

export function PostStats({ slug }: { slug: string }) {
  const [stats, setStats] = useState<Stats>({ views: 0, likes: 0 });
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(`chasey:liked:${slug}`) === "1");
    } catch {
      /* ignore */
    }
    let cancelled = false;
    const run = async () => {
      try {
        const viewed = sessionStorage.getItem(`chasey:viewed:${slug}`) === "1";
        const res = await fetch(`/api/stats/${encodeURIComponent(slug)}`, {
          method: viewed ? "GET" : "POST",
          headers: { "Content-Type": "application/json" },
          body: viewed
            ? undefined
            : JSON.stringify({ action: "view", visitor: getVisitorId() }),
          cache: "no-store"
        });
        if (!res.ok) return;
        if (!viewed) sessionStorage.setItem(`chasey:viewed:${slug}`, "1");
        const data = (await res.json()) as Stats;
        if (!cancelled) setStats(data);
      } catch {
        /* ignore */
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    const action = liked ? "unlike" : "like";
    try {
      const res = await fetch(`/api/stats/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, visitor: getVisitorId() })
      });
      if (res.ok) {
        const data = (await res.json()) as Stats;
        setStats(data);
        const next = !liked;
        setLiked(next);
        try {
          localStorage.setItem(`chasey:liked:${slug}`, next ? "1" : "0");
        } catch {
          /* ignore */
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line/12 px-3 py-1.5 font-mono text-[9px] text-faint">
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
        {formatCount(stats.views)} 阅读
      </span>
      <button
        type="button"
        onClick={toggleLike}
        disabled={busy}
        aria-pressed={liked}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[9px] transition disabled:opacity-50 ${
          liked
            ? "border-accent/40 bg-accent/10 text-accent"
            : "border-line/12 text-faint hover:border-line/30 hover:text-ink"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
        {formatCount(stats.likes)} {liked ? "已赞" : "点赞"}
      </button>
    </div>
  );
}
