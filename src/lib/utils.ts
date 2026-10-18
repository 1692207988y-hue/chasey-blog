import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Shanghai"
  }).format(new Date(`${date}T00:00:00+08:00`));
}

export function formatDateShort(date: string) {
  return date.replaceAll("-", ".");
}

export function formatYear(date: string) {
  return date.slice(0, 4);
}

export function coverClass(variant: string) {
  return `cover-${variant}`;
}

export function tagHref(tag: string) {
  return `/tags/${encodeURIComponent(tag)}`;
}

export function categoryHref(category: string) {
  return `/categories/${encodeURIComponent(category)}`;
}
