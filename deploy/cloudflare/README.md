# Cloudflare Pages 部署手册

当前工程已支持 **Cloudflare Pages 静态导出 + Pages Functions**：

- 页面：`next build` 静态导出到 `out/`
- 点赞 / 阅读：`functions/api/stats/[slug].ts` + Cloudflare KV
- 搜索：构建时索引，纯客户端 Fuse.js
- 评论：Giscus
- 每日更新：GitHub Actions schedule 重新构建并部署
- 缓存：`_headers` 中配置 `_next/static` 一年 immutable

## ⚠️ ICP 说明

**Cloudflare Pages 不能用于中国大陆 ICP 备案。**  
如果网站需要 ICP 备案号与境内接入，必须回到阿里云/腾讯云等境内节点；Cloudflare Pages 只适合海外访问、个人预览或不要求 ICP 的站点。

## 1. 本地构建

```bash
pnpm install --ignore-scripts
pnpm build:cloudflare
```

产物在 `out/`。构建脚本会临时移出 `src/app/api`（静态导出不支持 Next API Routes），构建完成后自动恢复。

## 2. 创建 Cloudflare 资源

登录 Cloudflare：

```bash
pnpm exec wrangler login
```

创建 Pages 项目和 KV：

```bash
pnpm exec wrangler pages project create chasey-blog --production-branch main
pnpm exec wrangler kv namespace create STATS_KV
```

把返回的 KV namespace id 填入 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "STATS_KV"
id = "真实的 namespace id"
```

也可以在 Cloudflare Dashboard → Workers & Pages → KV 创建，并在 Pages 项目的 Functions → KV bindings 里绑定 `STATS_KV`。

> 未绑定 KV 时，点赞/阅读会使用 Pages Function 进程内存 fallback，仅适合本地预览，刷新/重建后清零。

## 3. 部署

```bash
pnpm exec wrangler pages deploy out --project-name=chasey-blog
```

首次部署会得到：

```text
https://chasey-blog.pages.dev
```

当前已绑定自定义域名：`https://blog.chasey.top`。`chasey.top` 原站保持不变。

## 4. 自定义域名

在 Cloudflare Dashboard：

**Workers & Pages → chasey-blog → Custom domains → Set up a custom domain**

添加 `chasey.top` 和 `www.chasey.top`。

如果域名当前使用 Netlify DNS（`chasey.top` 当前解析到 75.2.60.5），需要二选一：

1. 把 DNS 托管迁移到 Cloudflare（推荐，apex 域名可直接绑定）；
2. 或按 Cloudflare 提示添加 CNAME / 调整 DNS；apex 域名可能需要 CNAME flattening。

> 自定义域名与 DNS 修改需要 Cloudflare 账号权限；没有凭据无法从代码侧完成。

## 5. GitHub Actions 自动部署

工作流：`.github/workflows/deploy-cloudflare.yml`

在 GitHub Repository Secrets 配置：

```text
CLOUDFLARE_API_TOKEN       # 需要 Pages:Edit、Workers KV:Edit 权限
CLOUDFLARE_ACCOUNT_ID
```

在 Repository Variables 可选配置：

```text
CLOUDFLARE_PROJECT_NAME=chasey-blog
```

push `main` 后会自动：

1. `pnpm build:cloudflare`
2. 创建/检查 Pages 项目
3. `wrangler pages deploy out`

工作流还带每日 schedule（北京时间 03:20），会重新构建以刷新每日一言、GitHub 状态等构建时数据。

## 6. 与 Vercel / 阿里云方案的差异

| 能力 | Cloudflare Pages | 阿里云 ECS |
| --- | --- | --- |
| ICP 备案 | ❌ 不支持 | ✅ 可备案 |
| 静态页面 | ✅ | ✅ |
| 点赞/阅读 | Pages Functions + KV | Node API + Redis |
| 服务端 ISR | ❌ 静态导出 | ✅ |
| 自动更新 | GitHub Actions 定时重建 | systemd timer + 重新构建 |
| 中国大陆访问 | 可能不稳定 | 低延迟 |

## 7. 常见问题

### `src/app/api` 构建报错

Cloudflare 静态导出不支持 API Routes。使用 `pnpm build:cloudflare`，不要直接 `next build`；脚本会临时移出 API。

### 点赞一直返回 0

检查：

- `wrangler.toml` 中 KV namespace id 是否已替换；
- Pages 项目的 Functions → KV bindings 是否绑定 `STATS_KV`；
- 浏览器请求 `/api/stats/<slug>` 是否返回 200。

### 每日一言不更新

静态导出没有 ISR。需要在 GitHub Actions 中启用 schedule，或手动重新运行 `deploy-cloudflare.yml`。

### Giscus 无法加载

Giscus 依赖 GitHub；国内网络可能不稳定。对国内读者建议换自托管 Waline，或使用阿里云方案。
