-- Aggregated content tables.
-- Uses the existing chasey-stats D1 database as the content store.
-- Apply with:
--   wrangler d1 execute chasey-stats --remote --file=deploy/cloudflare/schema-content.sql

CREATE TABLE IF NOT EXISTS sources (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT    NOT NULL,
  slug            TEXT    NOT NULL UNIQUE,
  kind            TEXT    NOT NULL CHECK (kind IN ('rss', 'json', 'html')),
  url             TEXT    NOT NULL UNIQUE,
  config          TEXT    NOT NULL DEFAULT '{}',
  enabled         INTEGER NOT NULL DEFAULT 1,
  etag            TEXT,
  last_modified   TEXT,
  last_fetched_at TEXT,
  last_status     INTEGER,
  last_error      TEXT,
  created_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id     INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  external_id   TEXT    NOT NULL,
  url           TEXT    NOT NULL,
  url_key       TEXT    NOT NULL UNIQUE,
  title         TEXT    NOT NULL,
  summary       TEXT    NOT NULL DEFAULT '',
  author        TEXT,
  published_at  TEXT,
  first_seen_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fetched_at    TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  hidden        INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_items_published ON items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_source ON items(source_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_hidden ON items(hidden, published_at DESC);

CREATE TABLE IF NOT EXISTS fetch_runs (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at    TEXT,
  source_count   INTEGER NOT NULL DEFAULT 0,
  inserted_count INTEGER NOT NULL DEFAULT 0,
  failed_count   INTEGER NOT NULL DEFAULT 0
);

-- Optional seed sources. Keep disabled until you have reviewed their terms.
INSERT OR IGNORE INTO sources (name, slug, kind, url, config, enabled)
VALUES
  (
    '示例 RSS',
    'example-rss',
    'rss',
    'https://example.com/feed.xml',
    '{"maxItems":20}',
    0
  ),
  (
    '示例 JSON API',
    'example-json',
    'json',
    'https://api.example.com/posts',
    '{"itemsPath":"data","fields":{"id":"id","title":"title","url":"url","summary":"excerpt","date":"published_at","author":"author"},"maxItems":20}',
    0
  ),
  (
    '示例网页',
    'example-html',
    'html',
    'https://example.com/blog',
    '{"itemSelector":"article","titleSelector":"h2 a","linkSelector":"h2 a","summarySelector":"p","baseUrl":"https://example.com","maxItems":20}',
    0
  );
