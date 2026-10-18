import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

export type CoverVariant =
  | "aurora"
  | "nebula"
  | "orbit"
  | "paper"
  | "signal"
  | "sunset";

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  pinned?: boolean;
  featured?: boolean;
  cover?: CoverVariant;
  draft?: boolean;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  pinned: boolean;
  featured: boolean;
  cover: CoverVariant;
  readingMinutes: number;
  wordCount: number;
}

export interface Post extends PostMeta {
  content: string;
}

export interface TocItem {
  level: number;
  text: string;
  id: string;
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const COVER_VARIANTS: CoverVariant[] = ["aurora", "nebula", "orbit", "paper", "signal", "sunset"];

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.map((tag) => String(tag).trim()).filter(Boolean);
}

function countWords(text: string) {
  const chinese = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = text
    .replace(/[\u4e00-\u9fff]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return chinese + words;
}

function readPostFile(fileName: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;
  if (!frontmatter.title || !frontmatter.date) {
    throw new Error(`文章 ${fileName} 缺少 title 或 date`);
  }
  const words = countWords(content);
  const slug = fileName.replace(/\.mdx?$/, "");
  const cover = COVER_VARIANTS.includes(frontmatter.cover as CoverVariant)
    ? (frontmatter.cover as CoverVariant)
    : COVER_VARIANTS[slug.length % COVER_VARIANTS.length];

  return {
    slug,
    title: frontmatter.title,
    description: frontmatter.description || "",
    date: frontmatter.date,
    updated: frontmatter.updated,
    category: frontmatter.category || "随笔",
    tags: normalizeTags(frontmatter.tags),
    pinned: Boolean(frontmatter.pinned),
    featured: Boolean(frontmatter.featured),
    cover,
    readingMinutes: Math.max(1, Math.ceil(words / 380)),
    wordCount: words,
    content
  };
}

let postCache: Post[] | null = null;

export function getAllPosts(): Post[] {
  if (postCache) return postCache;
  if (!fs.existsSync(POSTS_DIR)) return [];
  const posts = fs
    .readdirSync(POSTS_DIR)
    .filter((file) => /\.mdx?$/.test(file))
    .map(readPostFile)
    .filter((post) => {
      const raw = matter(fs.readFileSync(path.join(POSTS_DIR, `${post.slug}.mdx`), "utf8")).data;
      return !raw.draft;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  postCache = posts;
  return posts;
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getPinnedPosts(): PostMeta[] {
  return getAllPosts().filter((post) => post.pinned);
}

export function getFeaturedPosts(limit = 6): PostMeta[] {
  return getAllPosts()
    .filter((post) => post.featured || post.pinned)
    .slice(0, limit);
}

export function getLatestPosts(limit = 8): PostMeta[] {
  return getAllPosts().slice(0, limit);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  getAllPosts().forEach((post) =>
    post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1))
  );
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh-CN"));
}

export function getAllCategories(): { category: string; count: number }[] {
  const counts = new Map<string, number>();
  getAllPosts().forEach((post) =>
    counts.set(post.category, (counts.get(post.category) || 0) + 1)
  );
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((post) => post.tags.some((item) => item === tag));
}

export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPosts().filter((post) => post.category === category);
}

export function getArchiveGroups(): { year: string; posts: PostMeta[] }[] {
  const groups = new Map<string, PostMeta[]>();
  getAllPosts().forEach((post) => {
    const year = post.date.slice(0, 4);
    groups.set(year, [...(groups.get(year) || []), post]);
  });
  return [...groups.entries()].map(([year, posts]) => ({ year, posts }));
}

export function getRelatedPosts(post: PostMeta, limit = 3): PostMeta[] {
  return getAllPosts()
    .filter((item) => item.slug !== post.slug)
    .map((item) => {
      const sharedTags = item.tags.filter((tag) => post.tags.includes(tag)).length;
      const sameCategory = item.category === post.category ? 2 : 0;
      return { item, score: sharedTags * 2 + sameCategory };
    })
    .sort((a, b) => b.score - a.score || (a.item.date < b.item.date ? 1 : -1))
    .slice(0, limit)
    .map(({ item }) => item);
}

export function getAdjacentPosts(slug: string) {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  return {
    previous: index > 0 ? posts[index - 1] : null,
    next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null
  };
}

export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  return markdown
    .split("\n")
    .map((line) => {
      const match = /^(#{2,4})\s+(.+?)\s*$/.exec(line);
      if (!match) return null;
      const level = match[1].length;
      const text = match[2]
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[*_~]/g, "")
        .trim();
      return { level, text, id: slugger.slug(text) };
    })
    .filter(Boolean) as TocItem[];
}

export function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface SearchDocument {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
  body: string;
  url: string;
}

export function getSearchDocuments(): SearchDocument[] {
  return getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category,
    tags: post.tags,
    date: post.date,
    body: stripMarkdown(post.content).slice(0, 6000),
    url: `/posts/${post.slug}`
  }));
}
