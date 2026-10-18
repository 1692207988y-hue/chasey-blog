import "server-only";

export interface DailyQuote {
  text: string;
  from: string;
}

export interface GitHubRepoStats {
  stars: number;
  forks: number;
  updatedAt: string;
  url: string;
}

const FALLBACK_QUOTE: DailyQuote = {
  text: "宇宙很大，先问一句为什么。",
  from: "Chasey · 夜班记录"
};

export async function getDailyQuote(): Promise<DailyQuote> {
  try {
    const res = await fetch("https://v1.hitokoto.cn/?c=d&c=i&encode=json", {
      next: { revalidate: 86400, tags: ["daily-quote"] }
    });
    if (!res.ok) return FALLBACK_QUOTE;
    const data = (await res.json()) as { hitokoto?: string; from?: string };
    if (!data.hitokoto) return FALLBACK_QUOTE;
    return {
      text: data.hitokoto,
      from: data.from || "一言"
    };
  } catch {
    return FALLBACK_QUOTE;
  }
}

export async function getGitHubStats(): Promise<GitHubRepoStats | null> {
  const repo = process.env.GITHUB_REPO;
  if (!repo) return null;
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "chasey-blog"
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
      next: { revalidate: 3600, tags: ["github-repo"] }
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      stargazers_count: number;
      forks_count: number;
      updated_at: string;
      html_url: string;
    };
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      updatedAt: data.updated_at,
      url: data.html_url
    };
  } catch {
    return null;
  }
}
