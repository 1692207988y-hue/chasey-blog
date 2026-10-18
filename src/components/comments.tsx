"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/lib/site";

export function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  const configured = Boolean(siteConfig.giscus.repo && siteConfig.giscus.repoId && siteConfig.giscus.categoryId);

  useEffect(() => {
    if (!configured || !ref.current) return;
    const container = ref.current;
    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", siteConfig.giscus.repo);
    script.setAttribute("data-repo-id", siteConfig.giscus.repoId);
    script.setAttribute("data-category", siteConfig.giscus.category);
    script.setAttribute("data-category-id", siteConfig.giscus.categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("data-loading", "lazy");
    container.appendChild(script);
    return () => {
      container.innerHTML = "";
    };
  }, [configured]);

  return (
    <section id="comments" className="mt-16 border-t border-line/10 pt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-accent2">Comments</p>
          <h2 className="mt-2 font-serif text-2xl tracking-tight text-ink">评论</h2>
        </div>
        <p className="text-[10px] text-faint">由 Giscus · GitHub Discussions 提供</p>
      </div>
      {configured ? (
        <div ref={ref} className="min-h-[180px]" />
      ) : (
        <div className="rounded-2xl border border-dashed border-line/20 bg-surface/50 p-6 text-sm leading-7 text-muted">
          <p>评论区尚未配置。</p>
          <p className="mt-2 text-xs text-faint">
            在环境变量中填写 `NEXT_PUBLIC_GISCUS_REPO`、`NEXT_PUBLIC_GISCUS_REPO_ID`、
            `NEXT_PUBLIC_GISCUS_CATEGORY_ID` 后，评论区会自动启用。配置说明见 README。
          </p>
        </div>
      )}
    </section>
  );
}
