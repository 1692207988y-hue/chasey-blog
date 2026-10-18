#!/usr/bin/env node
/**
 * Lightweight static-output contract check, run in CI and before deploy.
 * Keeps SEO URLs and required pages from silently regressing.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const out = path.join(process.cwd(), "out");
const required = [
  "index.html",
  "404.html",
  "posts/index.html",
  "discover/index.html",
  "posts/rebuilding-blog-with-nextjs/index.html",
  "search/index.html",
  "rss.xml",
  "sitemap.xml",
  "robots.txt",
  "manifest.webmanifest"
];

const failures = [];
for (const file of required) {
  if (!existsSync(path.join(out, file))) failures.push(`missing ${file}`);
}

if (existsSync(path.join(out, "sitemap.xml"))) {
  const xml = readFileSync(path.join(out, "sitemap.xml"), "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (!locs.length) failures.push("sitemap has no <loc>");
  for (const loc of locs) {
    const pathname = new URL(loc).pathname;
    if (!pathname.endsWith("/")) failures.push(`sitemap URL missing trailing slash: ${loc}`);
  }
}

if (existsSync(path.join(out, "rss.xml"))) {
  const xml = readFileSync(path.join(out, "rss.xml"), "utf8");
  const links = [...xml.matchAll(/<link>([^<]+)<\/link>/g)].map((match) => match[1]);
  const itemLinks = links.filter((link) => link.includes("/posts/"));
  for (const link of itemLinks) {
    if (!new URL(link).pathname.endsWith("/")) failures.push(`RSS item URL missing trailing slash: ${link}`);
  }
  if (!itemLinks.length) failures.push("RSS has no post item links");
}

if (existsSync(path.join(out, "index.html"))) {
  const html = readFileSync(path.join(out, "index.html"), "utf8");
  if (!html.includes('rel="canonical"')) failures.push("home is missing canonical");
}

if (failures.length) {
  console.error("Static output check failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Static output check passed");
