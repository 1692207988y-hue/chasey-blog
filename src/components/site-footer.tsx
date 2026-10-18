import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/10">
      <div className="mx-auto grid max-w-content gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl tracking-tight text-ink">Chasey<span className="text-accent">.</span></p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-muted">
            写代码、读书、偶尔在银河系巡逻。这里记录一些值得留下来的东西。
          </p>
          <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
            {siteConfig.location}
          </p>
        </div>

        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">Navigate</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted">
            <Link href="/posts" className="transition hover:text-ink">文章</Link>
            <Link href="/archive" className="transition hover:text-ink">归档</Link>
            <Link href="/categories" className="transition hover:text-ink">分类</Link>
            <Link href="/tags" className="transition hover:text-ink">标签</Link>
            <Link href="/about" className="transition hover:text-ink">关于</Link>
            <Link href="/links" className="transition hover:text-ink">友链</Link>
          </div>
        </div>

        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">Elsewhere</p>
          <div className="mt-4 space-y-2 text-sm text-muted">
            <a href={`mailto:${siteConfig.email}`} className="block transition hover:text-ink">邮件</a>
            <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="block transition hover:text-ink">GitHub</a>
            <Link href="/rss.xml" className="block transition hover:text-ink">RSS 订阅</Link>
            <Link href="/privacy" className="block transition hover:text-ink">隐私说明</Link>
            <Link href="/terms" className="block transition hover:text-ink">使用条款</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-line/10">
        <div className="mx-auto flex max-w-content flex-col gap-2 px-5 py-5 text-[10px] leading-5 text-faint sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} Chasey. 保留所有权利。</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {siteConfig.icp ? (
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                {siteConfig.icp}
              </a>
            ) : (
              <span title="Vercel 不支持中国大陆 ICP 备案接入，正式备案号需在境内节点完成后填写">ICP 备案号待配置</span>
            )}
            {siteConfig.publicSecurity && siteConfig.publicSecurityUrl ? (
              <a href={siteConfig.publicSecurityUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                {siteConfig.publicSecurity}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
