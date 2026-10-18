import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "友链",
  description: "Chasey 的友情链接：一些值得认识的人和站点。",
  alternates: { canonical: "/links" }
};

const links = [
  {
    name: "河海大学",
    description: "母校官网，也是我每天待得最久的地方。",
    href: "https://www.hhu.edu.cn/",
    tag: "学校"
  },
  {
    name: "Next.js",
    description: "这个博客使用的全栈 React 框架。",
    href: "https://nextjs.org/",
    tag: "工具"
  },
  {
    name: "Vercel",
    description: "部署与边缘网络。",
    href: "https://vercel.com/",
    tag: "工具"
  },
  {
    name: "Solar System Scope",
    description: "太阳系图谱里使用的 CC BY 4.0 行星贴图来源。",
    href: "https://www.solarsystemscope.com/textures/",
    tag: "素材"
  }
];

export default function LinksPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="section-label">Links</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">友情链接。</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          一些对我和这个网站有帮助的站点。欢迎交换友链，请先通过邮件告诉我你的站点。
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-3xl border border-line/12 bg-surface/50 p-6 transition hover:-translate-y-1 hover:border-line/25 hover:shadow-card"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-accent2">{link.tag}</span>
              <span className="text-faint transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">↗</span>
            </div>
            <h2 className="mt-4 font-serif text-2xl text-ink transition group-hover:text-accent">{link.name}</h2>
            <p className="mt-2 text-xs leading-6 text-muted">{link.description}</p>
          </a>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-dashed border-line/20 p-6 text-sm leading-7 text-muted">
        <p className="font-medium text-ink">申请友链</p>
        <p className="mt-2 text-xs leading-6 text-muted">
          请把站点名称、地址、一句话介绍和头像地址发送到{" "}
          <Link href="mailto:1692207988y@gmail.com" className="text-accent underline underline-offset-2">
            1692207988y@gmail.com
          </Link>
          。本站不接受纯 SEO 站、采集站和无法正常访问的站点。
        </p>
      </div>
    </div>
  );
}
