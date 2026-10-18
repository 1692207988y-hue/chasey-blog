export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Chasey",
  title: "Chasey · 个人博客",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "河海大学大二学生，兼职宇宙超人。记录代码、阅读与在太阳系里的日常。",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://chasey.top").replace(/\/$/, ""),
  email: "1692207988y@gmail.com",
  location: "地球 · 河海大学",
  github: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/",
  icp: process.env.NEXT_PUBLIC_ICP_NUMBER || "",
  publicSecurity: process.env.NEXT_PUBLIC_PUBLIC_SECURITY_NUMBER || "",
  publicSecurityUrl: process.env.NEXT_PUBLIC_PUBLIC_SECURITY_URL || "",
  giscus: {
    repo: process.env.NEXT_PUBLIC_GISCUS_REPO || "",
    repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "",
    category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || "Announcements",
    categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || ""
  }
};

export const navItems = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/archive", label: "归档" },
  { href: "/categories", label: "分类" },
  { href: "/tags", label: "标签" },
  { href: "/about", label: "关于" },
  { href: "/links", label: "友链" }
];

export function pageUrl(path = "/") {
  const url = new URL(path, `${siteConfig.url}/`);
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  url.hash = "";
  url.search = "";
  return url.toString();
}

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export const GISCUS_CONFIGURED = Boolean(
  siteConfig.giscus.repo && siteConfig.giscus.repoId && siteConfig.giscus.categoryId
);
