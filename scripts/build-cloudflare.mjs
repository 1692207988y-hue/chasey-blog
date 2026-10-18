#!/usr/bin/env node
/**
 * Cloudflare Pages 静态导出构建。
 * App Router 的 API Routes 不能出现在 output: export 中，
 * 构建时临时移出 src/app/api，构建完自动恢复。
 */
import { spawnSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const apiDir = path.join(root, "src", "app", "api");
const backupDir = path.join(root, ".cloudflare-build", "api");

function restore() {
  if (existsSync(backupDir)) {
    if (existsSync(apiDir)) rmSync(apiDir, { recursive: true, force: true });
    renameSync(backupDir, apiDir);
  }
}

if (existsSync(backupDir)) restore();
rmSync(path.join(root, "out"), { recursive: true, force: true });

if (existsSync(apiDir)) {
  const { mkdirSync } = await import("node:fs");
  mkdirSync(path.dirname(backupDir), { recursive: true });
  renameSync(apiDir, backupDir);
}

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  cwd: root,
  env: {
    ...process.env,
    BUILD_CLOUDFLARE: "true",
    NEXT_TELEMETRY_DISABLED: "1"
  }
});

restore();
process.exit(result.status ?? 1);
