#!/usr/bin/env node
/**
 * Cloudflare Pages static export.
 * API is served by Pages Functions in functions/, not by Next route handlers,
 * so no source directory needs to be moved during the build.
 */
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
rmSync(path.join(root, "out"), { recursive: true, force: true });

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

process.exit(result.status ?? 1);
