import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "隐私说明",
  description: "Chasey 博客的隐私说明：收集什么数据、如何使用第三方服务，以及你的权利。",
  alternates: { canonical: "/privacy" }
};

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl py-14 sm:py-20">
      <header>
        <p className="section-label">Privacy</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">隐私说明。</h1>
        <p className="mt-4 text-xs leading-6 text-faint">最后更新：2026 年 10 月</p>
      </header>

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
        <p>本页面说明 {siteConfig.name} 的个人博客如何处理访问者的数据。本站是个人非商业博客，尽量只收集维持基本功能所需的最少信息。</p>

        <h2>我们收集什么</h2>
        <ul>
          <li><strong>访问日志</strong>：部署平台 Vercel 可能记录访问日志（IP、User-Agent、请求路径），用于安全和故障排查。</li>
          <li><strong>阅读与点赞统计</strong>：如果你使用点赞功能，我们会记录文章的聚合计数，不保存可识别个人身份的信息。阅读数按会话去重。</li>
          <li><strong>评论</strong>：评论由 Giscus 提供，登录与评论数据由 GitHub 处理。发表评论时适用 GitHub 的隐私政策。</li>
          <li><strong>本地存储</strong>：浏览器会保存主题偏好与点赞状态，仅存储在你的设备：不用于广告，也不会上传到服务器。</li>
        </ul>

        <h2>第三方服务</h2>
        <ul>
          <li>Vercel：网站托管、边缘网络与访问日志。</li>
          <li>Giscus 与 GitHub：评论系统与 GitHub 登录。</li>
          <li>一言（Hitokoto）API：首页每日句子。</li>
          <li>GitHub API：仓库公开状态（stars、更新时间）。</li>
        </ul>

        <h2>我们不做什么</h2>
        <ul>
          <li>不使用广告跟踪像素。</li>
          <li>不建立用户画像。</li>
          <li>不出售或出租任何数据。</li>
        </ul>

        <h2>你的权利</h2>
        <p>你可以要求删除你通过邮件提供的个人信息。评论内容请直接在 GitHub Discussions 中管理或联系站长处理。</p>

        <h2>联系</h2>
        <p>如对本说明有疑问，请联系 <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>。</p>
      </div>

      <div className="mt-10 flex gap-3 text-xs">
        <Link href="/terms" className="text-accent underline underline-offset-2">使用条款</Link>
        <Link href="/" className="text-muted">返回首页</Link>
      </div>
    </div>
  );
}
