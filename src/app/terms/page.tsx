import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "使用条款",
  description: "Chasey 博客的内容许可、使用边界与免责声明。",
  alternates: { canonical: "/terms" }
};

export default function TermsPage() {
  return (
    <div className="container-page max-w-3xl py-14 sm:py-20">
      <header>
        <p className="section-label">Terms</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">使用条款。</h1>
        <p className="mt-4 text-xs leading-6 text-faint">最后更新：2026 年 10 月</p>
      </header>

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
        <h2>内容许可</h2>
        <p>除特别注明外，本站原创文章采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a> 许可：允许署名、非商业性转载与相同方式共享。转载请注明作者与原文链接。</p>
        <p>站内使用的行星贴图来自 Solar System Scope，遵循 CC BY 4.0 许可；相关署名见页面底部与素材说明。代码示例可自由用于学习与非商业项目。</p>

        <h2>免责声明</h2>
        <p>本站内容仅代表个人观点，不构成专业建议。技术文章可能随时间过时，请以官方文档为准。因使用本站内容造成的任何损失，作者不承担责任。</p>

        <h2>评论规范</h2>
        <p>评论由 Giscus / GitHub Discussions 承载。请遵守 GitHub 社区准则，不要发布违法、骚扰、广告或侵犯他人权利的内容。站长保留删除不当评论的权利。</p>

        <h2>外部链接</h2>
        <p>本站包含指向第三方网站的链接。我们不对第三方网站的内容、隐私做法或可用性负责。</p>

        <h2>备案与运营</h2>
        <p>本站为个人非商业博客。涉及中国大陆访问与备案时，请以实际部署服务商与监管要求为准。若发现侵权或违规内容，请联系 <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> 处理。</p>
      </div>

      <div className="mt-10 flex gap-3 text-xs">
        <Link href="/privacy" className="text-accent underline underline-offset-2">隐私说明</Link>
        <Link href="/" className="text-muted">返回首页</Link>
      </div>
    </div>
  );
}
