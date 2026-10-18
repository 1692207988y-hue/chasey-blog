-- Cloudflare D1 schema for blog stats.
-- Apply with:
--   wrangler d1 execute chasey-stats --remote --file=deploy/cloudflare/schema.sql

CREATE TABLE IF NOT EXISTS post_likes (
  slug TEXT NOT NULL,
  visitor TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (slug, visitor)
);

CREATE TABLE IF NOT EXISTS post_views (
  slug TEXT NOT NULL,
  visitor TEXT NOT NULL,
  day TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (slug, visitor, day)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_slug ON post_likes(slug);
CREATE INDEX IF NOT EXISTS idx_post_views_slug ON post_views(slug);
CREATE INDEX IF NOT EXISTS idx_post_views_day ON post_views(day);
