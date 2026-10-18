#!/usr/bin/env bash
set -euo pipefail

# 在阿里云 ECS（Ubuntu 22.04/24.04）上执行。
# 不负责域名解析与 ICP 备案；备案完成后再对外开放 80/443。

if [ "$(id -u)" -ne 0 ]; then
  echo "请使用 root 或 sudo 运行。"
  exit 1
fi

echo "警告：请先完成 ICP 备案再对外开放 80/443；本脚本会配置防火墙。"
apt-get update
apt-get install -y ca-certificates curl gnupg nginx docker.io docker-compose-plugin certbot python3-certbot-nginx ufw

systemctl enable --now docker
systemctl enable --now nginx

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

mkdir -p /opt/chasey-blog
mkdir -p /var/www/certbot
mkdir -p /etc/nginx/ssl

echo ""
echo "基础环境已安装。下一步："
echo "1. 把 chasey-blog 代码放到 /opt/chasey-blog。"
echo "2. cp deploy/aliyun/.env.production.example /opt/chasey-blog/.env.production，并填写真实值。"
echo "3. （docker-compose.yml 已在项目根目录）。"
echo "4. cd /opt/chasey-blog && docker compose --env-file .env.production up -d --build。"
echo "5. 把证书放到 /etc/nginx/ssl/chasey.top.pem 与 .key，或使用 certbot 签发。"
echo "6. 启用 nginx.conf 并 systemctl reload nginx。"
echo "7. 配置每日刷新定时任务（见 deploy/aliyun/README.md）。"

