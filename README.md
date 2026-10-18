# Chasey Blog

一个面向长期写作的个人博客：**Next.js 14 App Router + TypeScript + Tailwind CSS + MDX**。

**线上地址：<https://blog.chasey.top>**（Cloudflare Pages 已部署；`chasey.top` 原站保持不变，博客作为独立子站）

部署支持：

- **Cloudflare Pages（当前目标）**：静态导出 + Pages Functions + KV，GitHub Actions 自动部署。
- **阿里云 ECS + Docker + Nginx**：保留给需要中国大陆 ICP 备案的场景。
- **Vercel**：保留给海外预览。

> ⚠️ Cloudflare Pages 不能做中国大陆 ICP 备案。需要备案时必须使用阿里云等境内节点。

现有静态站点保留在 `../personal-site`，本目录是独立的博客工程，不会覆盖旧站。上线时可以选择把 `chasey.top` 指向这个项目，或先部署到独立子域名验证。

## 技术栈

- Next.js 14.2（App Router、Server Components；Cloudflare 使用静态导出，API 改由 Pages Functions 提供）
- TypeScript 严格模式
- Tailwind CSS + `@tailwindcss/typography`
- MDX（`next-mdx-remote`）+ `remark-gfm` + `rehype-slug` + `rehype-highlight`
- 客户端搜索：Fuse.js（构建时生成索引，标题 / 正文 / 标签）
- 评论：Giscus（GitHub Discussions，可替换为 Waline）
- 点赞 / 阅读：Cloudflare KV（Pages Functions）、阿里云 Redis 或 Vercel KV；未配置时内存 fallback
- 自动更新：GitHub Actions schedule 重新构建（Cloudflare）/ Vercel Cron / 阿里云 systemd timer
- 部署：Cloudflare Pages（当前）、阿里云 ECS 或 Vercel

## 功能清单

### 内容
- MDX 文章，代码高亮、图片懒加载、自动目录
- 分类、标签、按时间归档
- 首页置顶、精选、最新文章
- 文章上下篇、相关推荐、阅读时长、字数
- RSS、sitemap、robots、JSON-LD、Open Graph

### 交互
- 全局搜索页，支持标题与正文检索
- Giscus 评论（环境变量未配置时显示说明占位）
- 点赞、阅读统计（阿里云 Redis / Vercel KV，未配置时本地内存演示）
- 深色 / 浅色主题，跟随系统并可记忆
- 阅读进度条、回到顶部、移动端菜单

### 工程
- 静态资源内容哈希 + 一年 immutable 缓存
- HTML 短缓存 / 重新验证
- `/api/cron/refresh` 每日重新验证首页数据
- GitHub Actions CI、Vercel / 阿里云 ACR 部署、每日刷新工作流
- 隐私说明、使用条款、备案信息组件

## 快速开始

环境要求：Node.js 20+、pnpm 9+。

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

打开 <http://localhost:3000>。

生产构建：

```bash
pnpm typecheck
pnpm build
pnpm start
```

## 内容写作

文章放在 `content/posts/*.mdx`：

```mdx
---
title: "文章标题"
description: "用于列表和 SEO 的一句话摘要"
date: "2026-10-18"
updated: "2026-10-18"
category: "工程"
tags: ["Next.js", "Vercel"]
pinned: false
featured: true
cover: "aurora"
---

正文从这里开始。
```

支持 `cover` 预设：`aurora`、`nebula`、`orbit`、`paper`、`signal`、`sunset`。

新增文章后提交到 `main`，Vercel 会自动构建；分类、标签、归档、搜索索引和 RSS 都会在构建时自动更新。

## 环境变量

完整列表见 `.env.example`。

### 站点
```env
NEXT_PUBLIC_SITE_URL=https://chasey.top
NEXT_PUBLIC_SITE_NAME=Chasey
NEXT_PUBLIC_SITE_DESCRIPTION=...
```

### Giscus 评论
1. 在 GitHub 创建一个公开仓库，开启 Discussions。
2. 安装 [Giscus App](https://github.com/apps/giscus)。
3. 在 <https://giscus.app/zh-CN> 选择仓库与 Discussion 分类，复制 `repo-id` 和 `category-id`。
4. 填写：
```env
NEXT_PUBLIC_GISCUS_REPO=your-name/chasey-blog
NEXT_PUBLIC_GISCUS_REPO_ID=R_xxx
NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxx
```

### Vercel KV（点赞 / 阅读）
在 Vercel 项目 → Storage 中创建 KV / Upstash Redis，连接项目后会自动注入 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN`。未配置时使用进程内存 fallback，仅用于本地预览，重启后清零。

### 自动刷新
```env
CRON_SECRET=一段足够长的随机字符串
GITHUB_REPO=your-name/your-repo
GITHUB_TOKEN=可选，提高 GitHub API 限额
```

## 线上状态

- Cloudflare Pages 项目：`chasey-blog`
- 线上地址：<https://blog.chasey.top>
- `chasey.top`：原个人网站保持不变，已增加博客入口
- 点赞 / 阅读 KV 已绑定并通过接口验证
- `blog.chasey.top` 已通过 Netlify DNS CNAME 接入 Cloudflare Pages；`chasey.top` 仍指向原 Netlify 站点

## 部署到 Cloudflare Pages（当前目标）

完整步骤见 **[deploy/cloudflare/README.md](deploy/cloudflare/README.md)**。

```bash
pnpm install --ignore-scripts
pnpm build:cloudflare
pnpm exec wrangler pages project create chasey-blog --production-branch main
pnpm exec wrangler kv namespace create STATS_KV
# 将 KV id 写入 wrangler.toml
pnpm exec wrangler pages deploy out --project-name=chasey-blog
```

- 静态页面输出到 `out/`
- 点赞/阅读由 `functions/api/stats/[slug].ts` + KV 提供
- `.github/workflows/deploy-cloudflare.yml` 负责 push 自动部署和每日定时重建
- Cloudflare Pages 自定义域名需要 Cloudflare 账号与 DNS 权限

> **Cloudflare Pages 无法满足中国大陆 ICP 备案。** 这是托管地域与接入商限制，无法通过代码绕过。

## 部署到阿里云 ECS（需要 ICP 备案时使用）

完整步骤见 **[deploy/aliyun/README.md](deploy/aliyun/README.md)**。

核心架构：

```text
ECS（境内地域）→ Nginx HTTPS → Docker Next.js :3000
                         └── Redis（点赞 / 阅读）
                         └── systemd timer（每日刷新）
```

工程包含：

- `Dockerfile`：Next.js standalone 多阶段镜像
- `docker-compose.yml`：app + Redis
- `deploy/aliyun/nginx.conf`：HTTPS 反向代理与缓存
- `deploy/aliyun/setup-ecs.sh`：ECS 基础环境
- `deploy/aliyun/refresh-data.sh` + systemd timer：每日刷新
- `.github/workflows/deploy-aliyun.yml`：GitHub Actions → 阿里云 ACR → ECS

## 部署到 Vercel（海外 / 预览）

1. 把本目录推送到 GitHub 仓库。
2. 在 Vercel 中 Import Project，Framework 选择 Next.js。
3. 填写 `.env.example` 中的环境变量。
4. 部署后绑定 `chasey.top`，在域名 DNS 处按 Vercel 指引配置。
5. 在 Vercel 项目中启用 Cron（`vercel.json` 已配置每天 03:00 Asia/Shanghai 的刷新）；阿里云部署则使用 systemd timer。

### GitHub Actions 自动部署（可选）
Vercel 的 Git Integration 本身可以在 push 后自动部署。如果希望由 GitHub Actions 显式执行：

- 在 GitHub Repository Secrets 中配置：
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `CRON_SECRET`
- `.github/workflows/deploy.yml` 会在 push `main` 后执行 `vercel pull → build → deploy`。
- `.github/workflows/refresh.yml` 每天 03:00 调用 `/api/cron/refresh`。

> 如果同时启用 Vercel Git Integration 和 GitHub Actions 部署，会产生两次构建。建议二选一。

## 缓存策略

| 内容 | 策略 |
| --- | --- |
| `/_next/static/*` | 内容哈希 + `max-age=31536000, immutable` |
| HTML 页面 | ISR / `revalidate` + 短缓存 |
| 首页动态数据 | `revalidate: 3600`，Cron 每日重新验证 |
| 点赞 / 阅读 API | `no-store`，不进入 CDN 缓存 |
| RSS | `s-maxage=3600` |

## 项目结构

```text
chasey-blog/
├── content/posts/              # MDX 文章
├── src/app/                    # App Router 页面与 API
│   ├── page.tsx                # 首页
│   ├── posts/                  # 列表 + 详情
│   ├── tags/ categories/       # 标签 / 分类
│   ├── archive/ search/        # 归档 / 搜索
│   ├── about/ links/           # 关于 / 友链
│   ├── privacy/ terms/         # 合规页面
│   ├── api/stats/[slug]/       # 点赞 / 阅读
│   ├── api/cron/refresh/       # 定时重新验证
│   ├── sitemap.ts robots.ts    # SEO
│   └── rss.xml/route.ts        # RSS
├── src/components/             # 组件
├── src/lib/                    # 内容 / 统计 / 数据 / SEO
├── .github/workflows/          # CI、部署、每日刷新
├── functions/api/stats/        # Cloudflare Pages Functions（点赞/阅读）
├── wrangler.toml               # Cloudflare Pages / KV 配置
├── deploy/cloudflare/          # Cloudflare Pages 部署手册
├── deploy/aliyun/              # 阿里云部署手册（备用）
├── Dockerfile                  # 阿里云 ECS 镜像（备用）
├── docker-compose.yml          # app + Redis（备用）
├── vercel.json                 # Cron 与缓存头
└── .env.example
```

## ⚠️ 关于 ICP 备案与国内合规

这一点必须说清楚：

1. **Vercel 不是中国大陆 ICP 备案的接入服务商。** 仅把网站部署在 Vercel，不能满足《互联网信息服务管理办法》下的 ICP 备案要求，也不能使用真实的备案号。
2. 如果网站面向中国大陆用户且需要备案，应使用**境内节点**的云服务商完成 ICP 备案。本工程已提供**阿里云 ECS + Docker** 的完整部署方案（见 `deploy/aliyun/`）；备案主体、域名与接入服务商必须一致。
3. 本工程已做：
   - 页脚备案号组件；
   - 隐私说明 / 使用条款；
   - 无广告追踪、尽量少收集数据；
   - 评论 / 统计等第三方服务披露；
   - 安全响应头、无 `poweredByHeader`。
4. 在 `NEXT_PUBLIC_ICP_NUMBER` 填入真实备案号之前，页脚会显示「ICP 备案号待配置」，**不会伪造备案号**。

**Cloudflare Pages 同样不能用于 ICP 备案。** 如果必须备案，应使用阿里云境内 ECS、完成 ICP 备案，并让域名直接解析到阿里云；Cloudflare Pages 只适合海外访问或不要求 ICP 的场景。

## 已知限制

- Giscus 依赖 GitHub，部分网络环境下可能无法加载；国内读者为主的站点建议换自托管 Waline。
- Vercel Cron 的调度时区为 UTC；`vercel.json` 已使用 `0 19 * * *`（北京时间 03:00）。
- 未配置 Vercel KV 时，点赞 / 阅读使用本地内存 fallback，不适合生产。
- 搜索索引在构建时生成，新增文章后需要重新部署。

## License

文章内容默认 CC BY-NC-SA 4.0；代码可自由用于学习与非商业项目。
