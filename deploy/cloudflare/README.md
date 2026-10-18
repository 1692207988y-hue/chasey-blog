# Cloudflare Pages 部署手册

当前架构：

```text
GitHub main
  → GitHub Actions（构建 / 校验）
  → Cloudflare Pages（静态 out/ + Pages Functions + D1）
  → https://blog.chasey.top
```

`https://chasey.top` 是原 Netlify 个人站，保持不变，不在此项目中部署。

## 本地构建

```bash
pnpm install --ignore-scripts
pnpm typecheck
pnpm typecheck:functions
pnpm build:cloudflare
pnpm check:static
```

产物在 `out/`。`build:cloudflare` 只做 Next.js 静态导出；API 由 `functions/` 中的 Pages Functions 提供，不再移动 `src/app/api`。

## Cloudflare 资源

如需从零创建：

```bash
pnpm exec wrangler login
pnpm exec wrangler pages project create chasey-blog --production-branch main
pnpm exec wrangler d1 create chasey-stats
pnpm exec wrangler d1 execute chasey-stats --remote --file=deploy/cloudflare/schema.sql
```

`wrangler.toml` 需要绑定：

```toml
[[d1_databases]]
binding = "STATS_DB"
database_name = "chasey-stats"
database_id = "真实的 database id"
```

表结构见 [schema.sql](schema.sql)。未绑定 D1 时，统计接口返回 503，不会写入错误数据。

## 发现页聚合

聚合表位于同一个 `chasey-stats` D1：

```bash
pnpm exec wrangler d1 execute chasey-stats \
  --remote \
  --file=deploy/cloudflare/schema-content.sql
```

`workers/aggregator` 是独立 Cron Worker：

```bash
cd workers/aggregator
pnpm install --ignore-scripts
pnpm exec wrangler deploy
```

它每小时/每 2 小时抓取 `sources` 中启用的 RSS / JSON / HTML 源，只保存标题、链接、400 字摘要和来源。`/api/discover` 读取同一 D1。

## 部署

```bash
pnpm exec wrangler pages deploy out --project-name=chasey-blog
```

首次部署得到 `https://chasey-blog.pages.dev`。当前自定义域名已经绑定为 `https://blog.chasey.top`。

## 自定义域名

**只操作博客子域名 `blog.chasey.top`，不要给 `chasey.top` 建 A/CNAME 或替换原站。**

在 Cloudflare Dashboard：

```text
Workers & Pages → chasey-blog → Custom domains
→ 添加 blog.chasey.top
```

当前 DNS 在 Netlify DNS：

```text
blog.chasey.top  CNAME  chasey-blog.pages.dev
```

`chasey.top` 仍指向原 Netlify 站点。若迁移 DNS，必须单独确认，不能影响 apex。

## GitHub Actions

工作流：`.github/workflows/deploy-cloudflare.yml`

Repository Secrets：

```text
CLOUDFLARE_API_TOKEN   # Pages Edit、D1 Edit（若仍使用 KV，再加 Workers KV Edit）
CLOUDFLARE_ACCOUNT_ID
```

Repository Variables（可选，构建时注入）：

```text
NEXT_PUBLIC_SITE_NAME
NEXT_PUBLIC_SITE_DESCRIPTION
NEXT_PUBLIC_GISCUS_REPO
NEXT_PUBLIC_GISCUS_REPO_ID
NEXT_PUBLIC_GISCUS_CATEGORY
NEXT_PUBLIC_GISCUS_CATEGORY_ID
NEXT_PUBLIC_GITHUB_URL
```

`NEXT_PUBLIC_*` 是构建时变量，只在 Cloudflare Dashboard 配置不会进入 GitHub Actions 构建。

工作流在 `main` push 后：

1. 安装依赖
2. `pnpm typecheck` / `pnpm typecheck:functions`
3. `pnpm build:cloudflare`
4. `pnpm check:static`
5. `wrangler pages deploy out`

每日北京时间 03:20 还会定时重建，刷新每日一言、GitHub 状态等构建时数据。

## 负载与缓存

| 内容 | 策略 |
| --- | --- |
| `/_next/static/*` | 一年 immutable |
| HTML | `max-age=0, must-revalidate` |
| RSS / sitemap | 1 小时 |
| `/api/*` | no-store |
| `*.pages.dev` | noindex |

安全头：nosniff、Referrer-Policy、X-Frame-Options、Permissions-Policy、HSTS、CSP。

## 常见问题

### 统计接口 503

- 检查 `wrangler.toml` 的 D1 id；
- 执行过 `schema.sql`；
- `/api/stats/<slug>` 返回 200。

### 评论不显示

Giscus 需要：

1. **公开** GitHub 仓库
2. 开启 GitHub Discussions
3. 安装 Giscus App
4. 把 repo-id / category-id 配成 GitHub Repository Variables

当前仓库为私有，因此评论仍是占位状态。

### 每日一言不更新

静态导出没有 ISR；依赖 GitHub Actions 的每日 schedule 或手动重跑 workflow。

### ICP

Cloudflare Pages 不能用于中国大陆 ICP 备案。需要备案时必须使用境内节点。
