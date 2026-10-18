"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navItems } from "@/lib/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "关闭菜单" : "打开菜单"}
        className="grid h-9 w-9 place-items-center rounded-full border border-line/15 text-ink"
      >
        <span className="relative block h-3 w-4">
          <span className={`absolute left-0 h-px w-4 bg-current transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 top-1.5 h-px w-4 bg-current transition ${open ? "opacity-0" : "opacity-100"}`} />
          <span className={`absolute left-0 h-px w-4 bg-current transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
        </span>
      </button>

      {open && (
        <div id="mobile-menu" className="fixed inset-0 top-[73px] z-50 bg-paper/95 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-content flex-col px-6 py-8" aria-label="移动端导航">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between border-b border-line/10 py-4 text-lg text-ink"
              >
                <span>{item.label}</span>
                <span className="font-mono text-[10px] text-faint">0{index + 1}</span>
              </Link>
            ))}
            <Link href="/search" className="mt-8 rounded-full border border-line/20 px-4 py-3 text-center text-sm text-muted">
              搜索文章
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
