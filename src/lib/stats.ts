import "server-only";

interface Stats {
  views: number;
  likes: number;
}

const fallback = ((globalThis as unknown as { __chaseyStats?: Map<string, Stats> })
  .__chaseyStats ||= new Map<string, Stats>());

type RedisLike = {
  hgetall: (key: string) => Promise<Record<string, string> | null>;
  hincrby: (key: string, field: string, value: number) => Promise<number>;
};

let redisPromise: Promise<RedisLike | null> | null = null;

async function redisClient(): Promise<RedisLike | null> {
  if (!process.env.REDIS_URL) return null;
  if (!redisPromise) {
    redisPromise = import("ioredis")
      .then(({ default: Redis }) => {
        const client = new Redis(process.env.REDIS_URL as string, {
          maxRetriesPerRequest: 2,
          lazyConnect: false,
          connectTimeout: 3000
        });
        client.on("error", () => {
          /* avoid noisy unhandled errors; operations fall back below */
        });
        return client as unknown as RedisLike;
      })
      .catch(() => null);
  }
  return redisPromise;
}

function hasVercelKv() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvClient() {
  if (!hasVercelKv()) return null;
  const { kv } = await import("@vercel/kv");
  return kv;
}

function key(slug: string) {
  return `chasey:stats:${slug}`;
}

function fallbackGet(slug: string): Stats {
  return fallback.get(slug) || { views: 0, likes: 0 };
}

function fallbackSet(slug: string, stats: Stats) {
  fallback.set(slug, stats);
  return stats;
}

export async function getStats(slug: string): Promise<Stats> {
  const redis = await redisClient();
  if (redis) {
    try {
      const data = await redis.hgetall(key(slug));
      return {
        views: Number(data?.views || 0),
        likes: Number(data?.likes || 0)
      };
    } catch {
      return fallbackGet(slug);
    }
  }

  const kv = await kvClient();
  if (!kv) return fallbackGet(slug);
  const data = await kv.hgetall<{ views?: number; likes?: number }>(key(slug));
  return {
    views: Number(data?.views || 0),
    likes: Number(data?.likes || 0)
  };
}

export async function incrementViews(slug: string): Promise<Stats> {
  const redis = await redisClient();
  if (redis) {
    try {
      await redis.hincrby(key(slug), "views", 1);
      return getStats(slug);
    } catch {
      const current = fallbackGet(slug);
      return fallbackSet(slug, { ...current, views: current.views + 1 });
    }
  }

  const kv = await kvClient();
  if (!kv) {
    const current = fallbackGet(slug);
    return fallbackSet(slug, { ...current, views: current.views + 1 });
  }
  await kv.hincrby(key(slug), "views", 1);
  return getStats(slug);
}

export async function toggleLike(slug: string, action: "like" | "unlike"): Promise<Stats> {
  const delta = action === "like" ? 1 : -1;
  const redis = await redisClient();
  if (redis) {
    try {
      await redis.hincrby(key(slug), "likes", delta);
      return getStats(slug);
    } catch {
      const current = fallbackGet(slug);
      return fallbackSet(slug, { ...current, likes: Math.max(0, current.likes + delta) });
    }
  }

  const kv = await kvClient();
  if (!kv) {
    const current = fallbackGet(slug);
    return fallbackSet(slug, { ...current, likes: Math.max(0, current.likes + delta) });
  }
  await kv.hincrby(key(slug), "likes", delta);
  return getStats(slug);
}
