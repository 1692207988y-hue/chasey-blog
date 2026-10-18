import Link from "next/link";
import { navItems } from "@/lib/site";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/10 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[73px] max-w-content items-center gap-6 px-5 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Chasey 博客首页">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-br from-[#9db4ff] via-[#6ee7d8] to-[#d8b4fe] text-[13px] font-bold text-[#080a10] shadow-[0_8px_24px_-14px_rgba(94,234,212,.9)]">
            C
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Chasey<span className="text-accent">.</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="主导航">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-[13px] text-muted transition hover:bg-surface hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            href="/search"
            aria-label="搜索文章"
            className="grid h-9 w-9 place-items-center rounded-full border border-line/15 text-muted transition hover:border-line/30 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </Link>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
