# Chasey Blog

一个面向长期写作的个人博客，部署在 Cloudflare Pages：

- **Next.js 14 App Router** + TypeScript + Tailwind CSS + MDX
- 静态导出到 `out/`
- 点赞 / 阅读由 **Cloudflare Pages Functions + D1** 提供
- GitHub Actions 自动构建、发布；每日定时重建

线上地址：<https://blog.chasey.top>  
原站 `https://chasey.top` 保持不变，博客是独立子站。

## 功能

- 首页：置顶、最新、分类入口、热门文章、每日一言
- 文章：MDX、代码高亮、自动目录、上下篇、相关阅读
- 分类、标签、归档、About、友链、隐私、条款
- 客户端全文搜索（标题 / 摘要 / 标签 / 正文）
- Giscus 评论组件（需要公开仓库并配置 Giscus）
- 点赞 / 阅读去重统计（D1 唯一键）
- SEO：metadata、canonical、sitemap、robots、RSS、JSON-LD、OG
- 自定义 404、阅读进度、主题切换、响应式导航

> Cloudflare Pages 不能用于中国大陆 ICP 备案。需要备案时必须使用境内节点。

## 本地开发

```bash
pnpm install --ignore-scripts
pnpm dev
```

本地 `next dev` 不提供 `/api/stats`，统计接口只在 Cloudflare Pages Functions 中运行。本地预览点赞/阅读需要使用：

```bash
pnpm build:cloudflare
pnpm exec wrangler pages dev out
```

## 构建与校验

```bash
pnpm typecheck
pnpm typecheck:functions
pnpm build:cloudflare
pnpm check:static
```

产物在 `out/`。`check:static` 会检查必需页面、sitemap 和 RSS 的尾部斜杠、canonical 等静态契约。

## 部署到 Cloudflare Pages

Cloudflare 项目：`chasey-blog`  
输出目录：`out`  
GitHub Actions 构建命令：

```bash
pnpm build:cloudflare
```

部署由 [.github/workflows/deploy-cloudflare.yml](.github/workflows/deploy-cloudflare.yml) 完成：

1. GitHub Actions 在 `main` push 后构建
2. 校验静态产物
3. `wrangler pages deploy out --project-name=chasey-blog`
4. 每日北京时间 03:20 定时重建

### GitHub Actions 配置

Secrets：

- `CLOUDFLARE_API_TOKEN`：需要 Pages Edit、D1 Edit、Workers KV Edit（如仍使用 KV）
- `CLOUDFLARE_ACCOUNT_ID`

Variables（可选，用于构建时注入前端公开配置）：

- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_DESCRIPTION`
- `NEXT_PUBLIC_GISCUS_REPO`
- `NEXT_PUBLIC_GISCUS_REPO_ID`
- `NEXT_PUBLIC_GISCUS_CATEGORY_ID`
- `NEXT_PUBLIC_GITHUB_URL`

`NEXT_PUBLIC_*` 是构建时变量；只配置在 Cloudflare Dashboard 不会进入 GitHub Actions 构建。

### D1 统计库

数据库：`chasey-stats`  
绑定：`STATS_DB`

初始化：

```bash
pnpm exec wrangler d1 execute chasey-stats --remote --file=deploy/cloudflare/schema.sql
```

表结构见 [deploy/cloudflare/schema.sql](deploy/cloudflare/schema.sql)。


## 发现页与自动聚合

`/discover` 是独立的内容聚合页，不把外部全文搬进博客。

- 数据表：复用 `chasey-stats` D1 中的 `sources / items / fetch_runs`
- 抓取：`workers/aggregator` 独立 Worker，Cron `0 */2 * * *`
- 只保存：标题、原文链接、最多 400 字摘要、作者、发布时间
- 去重：canonical URL + `items.url_key UNIQUE`
- 页面读取：`/api/discover` Pages Function → D1
- 当前启用示例源：Hacker News RSS；可在 `sources` 表禁用或替换

初始化内容表：

```bash
pnpm exec wrangler d1 execute chasey-stats \
  --remote \
  --file=deploy/cloudflare/schema-content.sql
```

部署 Worker：

```bash
cd workers/aggregator
pnpm install --ignore-scripts
pnpm exec wrangler deploy
```

Worker 详情见 [workers/aggregator/README.md](workers/aggregator/README.md)。

## 内容更新

在 GitHub 网页打开 `content/posts/`：

1. `Add file → Create new file`
2. 文件名使用英文短横线，例如 `my-new-post.mdx`
3. 粘贴：

```mdx
---
title: "文章标题"
description: "一句话摘要"
date: "2026-10-18"
category: "随笔"
tags: ["生活"]
---

正文。
```

4. `Commit changes`
5. GitHub Actions 出现绿色 `Deploy Cloudflare Pages` 后，访问：
   `https://blog.chasey.top/posts/my-new-post/`

修改文章：打开 `.mdx`，点铅笔，提交。  
删除文章：打开 `.mdx`，点垃圾桶，提交。  
图片：上传到 `public/images/`，正文写 `![说明](/images/文件名.jpg)`。

## 缓存与安全

| 内容 | 策略 |
| --- | --- |
| `/_next/static/*` | 内容哈希 + 一年 immutable |
| HTML | `max-age=0, must-revalidate` |
| RSS / sitemap | 1 小时 |
| `/api/*` | no-store |
| 安全头 | nosniff、Referrer-Policy、X-Frame-Options、HSTS、CSP |
| `*.pages.dev` | `X-Robots-Tag: noindex` |

## 已知限制

- Cloudflare Pages 静态导出，不支持 Next.js ISR / Server Actions 运行时。
- Giscus 需要 **公开 GitHub 仓库**、Discussions 和 Giscus App；当前仓库为私有，评论区只有在完成这些配置后才会显示。
- 点赞 / 阅读按浏览器 visitor ID 去重；没有账户体系，不能抵抗恶意伪造 visitor。
- 中国大陆访问与合规需要独立评估，Cloudflare Pages 不能 ICP 备案。
