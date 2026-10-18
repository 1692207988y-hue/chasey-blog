# 阿里云 ECS 部署手册

> 面向中国大陆合规的目标：**阿里云 ECS（境内地域）+ 域名备案 + Nginx HTTPS + Docker 运行 Next.js**。
> Vercel 无法提供 ICP 备案接入，因此本方案不再依赖 Vercel。

## 架构

```text
用户
  │  HTTPS
  ▼
阿里云 ECS（境内地域，已备案）
  ├── Nginx :443 / :80  →  反向代理
  ├── Docker: chasey-blog :3000（Next.js standalone）
  ├── Docker: redis :6379（点赞 / 阅读统计）
  └── systemd timer / cron → /api/cron/refresh（每日 03:15）
```

可选：阿里云 CDN + WAF、云监控、日志服务、云数据库 Redis。

## 1. 购买与备案

1. 购买**境内地域** ECS（建议 Ubuntu 22.04/24.04，2C2G 起）。
2. 在阿里云完成**域名实名认证**，并购买/备案域名 `chasey.top`。
3. 通过阿里云 **ICP 备案系统**提交备案：
   - 主体信息、网站信息、负责人信息；
   - 接入服务商选择阿里云；
   - 备案期间网站不能对外开放（ECS 安全组先不要放行 80/443）。
4. 备案通过后，按需办理**公安联网备案**，保存备案号与公安备案号。
5. 在 DNS 中添加 `A` 记录：`chasey.top` → ECS 公网 IP；`www` 可按需添加。
6. 安全组放行 `22`、`80`、`443`；只对必要 IP 开放 22。

> 不要在 Vercel 上挂“ICP 备案号”伪装备案。真实备案要求备案主体、域名、接入服务商与服务器一致。

## 2. 初始化 ECS

```bash
# 上传或 git clone 本项目到 /opt/chasey-blog
sudo bash /opt/chasey-blog/deploy/aliyun/setup-ecs.sh
```

安装 Docker、Docker Compose 插件、Nginx、Certbot、UFW。

## 3. 配置环境变量

```bash
cd /opt/chasey-blog
cp deploy/aliyun/.env.production.example .env.production
vim .env.production
```

必须填写：

- `NEXT_PUBLIC_SITE_URL=https://chasey.top`
- `REDIS_URL`：本地 compose 默认 `redis://redis:6379`；使用阿里云 Redis 时填专有网络地址
- `CRON_SECRET`：至少 32 位随机字符串
- `NEXT_PUBLIC_ICP_NUMBER`：**备案通过后**填真实备案号
- `NEXT_PUBLIC_GISCUS_*`：评论配置（可选）
- `GITHUB_REPO` / `GITHUB_TOKEN`：仓库状态（可选）

> `NEXT_PUBLIC_*` 变量会在构建时写入前端资源；修改后必须重新构建镜像，不能只重启容器。

## 4. 构建并启动

```bash
cd /opt/chasey-blog
docker compose --env-file .env.production up -d --build
docker compose --env-file .env.production ps
curl -I http://127.0.0.1:3000
```

容器只监听本机 `127.0.0.1:3000`，外部流量必须经过 Nginx。

## 5. 配置 Nginx 与 HTTPS

```bash
sudo cp deploy/aliyun/nginx.conf /etc/nginx/conf.d/chasey.conf
```

### 证书方案 A：阿里云 SSL 证书

在阿里云数字证书管理服务申请/下载 Nginx 格式证书，放到：

```text
/etc/nginx/ssl/chasey.top.pem
/etc/nginx/ssl/chasey.top.key
```

### 证书方案 B：Let's Encrypt

```bash
sudo certbot --nginx -d chasey.top -d www.chasey.top
```

然后：

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I https://chasey.top
```

## 6. 每日刷新

```bash
sudo cp deploy/aliyun/refresh-data.sh /opt/chasey-blog/refresh-data.sh
sudo chmod +x /opt/chasey-blog/refresh-data.sh

sudo cp deploy/aliyun/chasey-refresh.service /etc/systemd/system/
sudo cp deploy/aliyun/chasey-refresh.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now chasey-refresh.timer
systemctl list-timers | grep chasey
```

或使用 cron：

```cron
15 3 * * * /opt/chasey-blog/refresh-data.sh >> /var/log/chasey-refresh.log 2>&1
```

刷新只影响每日一言、GitHub 状态等缓存数据；文章更新仍需重新构建/部署。

## 7. 更新部署

### 手动

```bash
cd /opt/chasey-blog
git pull --ff-only
docker compose --env-file .env.production up -d --build
```

### GitHub Actions → 阿里云 ACR → ECS

1. 在阿里云容器镜像服务 ACR 创建命名空间与仓库 `chasey-blog`。
2. 在 GitHub Secrets 配置：
   - `ALIYUN_ACR_REGISTRY`，例如 `registry.cn-hangzhou.aliyuncs.com`
   - `ALIYUN_ACR_NAMESPACE`
   - `ALIYUN_ACR_USERNAME`
   - `ALIYUN_ACR_PASSWORD`
   - `ECS_HOST`、`ECS_USER`、`ECS_SSH_KEY`
   - `CRON_SECRET`
3. 在 GitHub Variables 配置 `NEXT_PUBLIC_GISCUS_*`。
4. 推送 `main` 后，`.github/workflows/deploy-aliyun.yml` 会构建镜像、推送 ACR，并通过 SSH 更新 ECS 上的 `app` 容器。

> 需确保 ECS 的 `/opt/chasey-blog` 已有 `docker-compose.yml` 与 `.env.production`，且 ECS 能登录 ACR。

## 8. Redis

### 本地方案
`docker-compose.yml` 已包含 Redis，数据持久化在 `redis-data` volume。

### 阿里云 Redis（推荐生产）
1. 购买阿里云云数据库 Redis，地域与 ECS 一致。
2. 配置白名单，加入 ECS 内网 IP。
3. 把 `REDIS_URL` 改为内网地址，例如：
   ```env
   REDIS_URL=redis://:password@r-xxxx.redis.rds.aliyuncs.com:6379/0
   ```
4. 重新构建/重启容器。

## 9. 国内合规注意事项

- 页脚显示真实备案号；`NEXT_PUBLIC_ICP_NUMBER` 为空时显示“待配置”，不要伪造。
- 隐私说明与使用条款已内置；评论、统计、每日一言、GitHub API 在页面中披露。
- **Giscus 依赖 GitHub**，国内网络可能不稳定；面向国内读者建议换自托管 **Waline** 并部署在阿里云。
- 不要接入未经备案的第三方统计/广告脚本。
- 定期备份 `content/`、Redis 数据，以及 `.env.production`（后者不要提交到 Git）。
- 内容需符合中国大陆互联网信息服务相关规定。

## 10. 可选：CDN / WAF

备案通过后可接入阿里云 CDN、WAF、云监控。注意：

- CDN 回源到 ECS；
- 缓存规则不要覆盖 `/api/`；
- HTML 保持短缓存；
- `/_next/static/` 可设置长缓存；
- WAF 规则不要把正常评论流量误杀。

## 回滚

```bash
cd /opt/chasey-blog
# 回滚到上一个镜像 tag
APP_IMAGE=registry.cn-hangzhou.aliyuncs.com/ns/chasey-blog:<previous-sha> \
  docker compose --env-file .env.production up -d --no-build app
```

或 `git checkout` 上一个提交后重新构建。

