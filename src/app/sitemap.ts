import type { MetadataRoute } from "next";
import { getAllCategories, getAllPosts, getAllTags } from "@/lib/posts";
import { pageUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const tags = getAllTags();
  const categories = getAllCategories();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: pageUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: pageUrl("/posts"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: pageUrl("/archive"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: pageUrl("/categories"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: pageUrl("/tags"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: pageUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: pageUrl("/links"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: pageUrl("/search"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: pageUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: pageUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 }
  ];

  return [
    ...staticRoutes,
    ...posts.map((post) => ({
      url: pageUrl(`/posts/${post.slug}`),
      lastModified: new Date(`${post.updated || post.date}T00:00:00+08:00`),
      changeFrequency: "monthly" as const,
      priority: 0.8
    })),
    ...tags.map((tag) => ({
      url: pageUrl(`/tags/${encodeURIComponent(tag.tag)}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6
    })),
    ...categories.map((category) => ({
      url: pageUrl(`/categories/${encodeURIComponent(category.category)}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6
    }))
  ];
}
