import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent2">404 · Not found</p>
      <h1 className="mt-4 font-serif text-5xl tracking-tight text-ink sm:text-7xl">这一页在宇宙里走丢了。</h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-muted">
        你访问的页面可能已经被移动、删除，或者它从一开始就不存在。
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper">返回首页</Link>
        <Link href="/posts" className="rounded-full border border-line/20 px-5 py-2.5 text-sm text-muted">浏览文章</Link>
      </div>
    </div>
  );
}
