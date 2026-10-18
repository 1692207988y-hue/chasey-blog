#!/usr/bin/env bash
set -euo pipefail

# 每日刷新脚本：由 cron / systemd timer 调用。
# 依赖 /opt/chasey-blog/.env.production 中的 CRON_SECRET。

ENV_FILE="${ENV_FILE:-/opt/chasey-blog/.env.production}"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

if [ -z "${CRON_SECRET:-}" ]; then
  echo "CRON_SECRET 未设置，拒绝调用刷新接口。" >&2
  exit 1
fi

curl --fail --show-error --silent \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "http://127.0.0.1:3000/api/cron/refresh"

echo ""
