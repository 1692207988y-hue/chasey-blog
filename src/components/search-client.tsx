"use client";

import Link from "next/link";
import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchDocument } from "@/lib/posts";

interface SearchClientProps {
  documents: SearchDocument[];
  initialQuery?: string;
}

export function SearchClient({ documents, initialQuery = "" }: SearchClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(documents, {
        keys: [
          { name: "title", weight: 0.45 },
          { name: "description", weight: 0.2 },
          { name: "tags", weight: 0.15 },
          { name: "body", weight: 0.2 }
        ],
        threshold: 0.36,
        ignoreLocation: true,
        includeScore: true,
        minMatchCharLength: 2
      }),
    [documents]
  );

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return documents.slice(0, 8);
    return fuse.search(trimmed).slice(0, 20).map((result) => result.item);
  }, [documents, fuse, query]);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("q");
    if (fromUrl) setQuery(fromUrl);
    inputRef.current?.focus();
  }, []);

  return (
    <div>
      <div className="relative">
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索标题、正文、标签……"
          aria-label="搜索文章"
          className="h-14 w-full rounded-2xl border border-line/15 bg-surface/70 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-faint focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
        />
        <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-line/15 px-1.5 py-1 font-mono text-[8px] text-faint sm:block">
          {query ? `${results.length} 条` : "全部"}
        </kbd>
      </div>

      <div className="mt-6 space-y-3">
        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line/20 p-8 text-center text-sm text-muted">
            没有找到相关文章，换个关键词试试。
          </div>
        ) : (
          results.map((item) => (
            <Link
              key={item.slug}
              href={item.url}
              className="group block rounded-2xl border border-line/10 bg-surface/50 p-5 transition hover:border-line/25 hover:bg-surface"
            >
              <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-faint">
                <span className="text-accent2">{item.category}</span>
                <span>{item.date}</span>
              </div>
              <h2 className="mt-2 font-serif text-xl text-ink transition group-hover:text-accent">{item.title}</h2>
              <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full border border-line/12 px-2 py-0.5 font-mono text-[8px] text-faint">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
