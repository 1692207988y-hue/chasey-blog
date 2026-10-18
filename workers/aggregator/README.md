# chasey-aggregator

独立的 Cloudflare Worker，负责定时抓取 RSS / JSON API / 指定网页，并写入项目共用的 D1。

- Cron：每 2 小时（UTC）
- D1：`chasey-stats` / binding `STATS_DB`
- 只保存标题、原文链接、400 字以内摘要、作者、发布时间
- 不保存全文、不绕过登录或付费墙
- URL canonicalize 后通过 `items.url_key UNIQUE` 去重
- 支持 ETag / Last-Modified 条件请求
- HTML 抓取依赖每个源配置的 CSS selector

## 初始化

```bash
pnpm install

# 在仓库根目录执行一次内容表迁移
pnpm exec wrangler d1 execute chasey-stats \
  --remote \
  --file=deploy/cloudflare/schema-content.sql

# 配置手动触发密钥
pnpm exec wrangler secret put ADMIN_TOKEN

# 部署
pnpm exec wrangler deploy
```

## 添加源

编辑 `deploy/cloudflare/schema-content.sql` 中的 sources 示例，或在 D1 中执行：

```sql
INSERT INTO sources (name, slug, kind, url, config, enabled)
VALUES ('来源名称', 'source-slug', 'rss', 'https://example.com/feed.xml', '{"maxItems":20}', 1);
```

只接入明确允许聚合的 RSS、公开 API 或有授权的网页。

## 手动触发

```bash
curl -X POST https://chasey-aggregator.<subdomain>.workers.dev/run \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

## 本地 Cron 测试

```bash
pnpm dev
curl "http://localhost:8787/__scheduled?cron=0+*/2+*+*+*"
```
