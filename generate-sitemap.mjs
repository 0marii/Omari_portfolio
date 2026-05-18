#!/usr/bin/env node
/**
 * Writes sitemap.xml (and robots.txt Sitemap line) using the deploy host.
 * On Vercel: VERCEL_PROJECT_PRODUCTION_URL or VERCEL_URL.
 * Locally: set SITE_URL=https://your-domain.com or skip (keeps existing files).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function siteBase() {
  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    process.env.SITE_URL?.replace(/^https?:\/\//, "");
  if (!host) return null;
  const clean = host.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${clean}`;
}

const entries = [
  { path: "/", changefreq: "weekly", priority: "1.0", hreflang: true },
  { path: "/games/", changefreq: "monthly", priority: "0.9" },
  ...[
    "wordle",
    "snake",
    "2048",
    "memory",
    "tetris",
    "flappy",
    "breakout",
    "tictactoe",
    "space",
    "dino",
    "whack",
    "pong",
    "tower",
    "connect4",
  ].map((slug) => ({
    path: `/games/${slug}`,
    changefreq: "yearly",
    priority: "0.7",
  })),
];

const lastmod = "2026-05-18";

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSitemap(base) {
  const urls = entries
    .map((e) => {
      const loc = `${base}${e.path === "/" ? "/" : e.path}`;
      const hreflang =
        e.hreflang
          ? `
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(loc)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}"/>`
          : "";
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>${hreflang}
  </url>`;
    })
    .join("\n\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

${urls}

</urlset>
`;
}

function patchRobots(base) {
  const robotsPath = join(root, "robots.txt");
  let robots = readFileSync(robotsPath, "utf8");
  const sitemapLine = `Sitemap: ${base}/sitemap.xml`;
  if (/^Sitemap:\s*.+$/m.test(robots)) {
    robots = robots.replace(/^Sitemap:\s*.+$/m, sitemapLine);
  } else {
    robots = `${robots.trimEnd()}\n\n${sitemapLine}\n`;
  }
  writeFileSync(robotsPath, robots);
}

const base = siteBase();
if (!base) {
  console.log(
    "generate-sitemap: no VERCEL_* or SITE_URL — keeping committed sitemap.xml / robots.txt",
  );
  process.exit(0);
}

writeFileSync(join(root, "sitemap.xml"), buildSitemap(base));
patchRobots(base);
console.log(`generate-sitemap: wrote sitemap for ${base}`);
