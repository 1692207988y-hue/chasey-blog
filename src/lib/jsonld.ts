import { absoluteUrl, pageUrl, siteConfig } from "@/lib/site";
import type { PostMeta } from "@/lib/posts";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.title,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "zh-CN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
    email: `mailto:${siteConfig.email}`,
    description: siteConfig.description,
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: "河海大学"
    }
  };
}

export function postJsonLd(post: PostMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    inLanguage: "zh-CN",
    mainEntityOfPage: pageUrl(`/posts/${post.slug}`),
    url: pageUrl(`/posts/${post.slug}`),
    articleSection: post.category,
    keywords: post.tags,
    image: absoluteUrl("/og.png"),
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.url
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.url
    }
  };
}
