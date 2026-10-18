import type { TocItem } from "@/lib/posts";

export function PostToc({ items }: { items: TocItem[] }) {
  if (!items.length) return null;
  return (
    <nav aria-label="文章目录" className="hidden xl:block">
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">On this page</p>
      <ul className="mt-4 space-y-2 border-l border-line/15 pl-4">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${Math.max(0, item.level - 2) * 10}px` }}>
            <a
              href={`#${item.id}`}
              className="block text-[11px] leading-5 text-muted transition hover:text-ink"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function PostTocMobile({ items }: { items: TocItem[] }) {
  if (!items.length) return null;
  return (
    <details className="mb-8 rounded-2xl border border-line/12 bg-surface/50 p-4 xl:hidden">
      <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
        目录 · {items.length} 节
      </summary>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="block text-xs leading-5 text-muted hover:text-ink">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
