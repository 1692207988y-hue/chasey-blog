import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 Chasey：河海大学大二学生、兼职宇宙超人，以及这个博客的由来。",
  alternates: { canonical: "/about" }
};

const stack = [
  { group: "Frontend", items: ["HTML / CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS"] },
  { group: "Backend", items: ["Node.js", "Python", "Java", "MySQL", "Linux"] },
  { group: "Tools", items: ["Git / GitHub", "Vercel", "Figma", "VS Code", "Canvas"] },
  { group: "Cosmic", items: ["太阳系巡逻", "快速学习", "熬夜", "咖啡"] }
];

export default function AboutPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <header className="max-w-3xl">
        <p className="section-label">About</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-6xl">
          你好，我是 <span className="bg-gradient-to-r from-accent via-accent2 to-accent bg-clip-text text-transparent">Chasey</span>。
        </h1>
        <p className="mt-6 text-sm leading-8 text-muted">
          河海大学大二学生，兼职宇宙超人。白天在教室和图书馆之间穿梭，晚上偶尔出个宇宙任务。
          我喜欢把奇怪的想法做成能跑起来的东西，这个博客就是其中之一。
        </p>
      </header>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["学校", "河海大学"],
          ["年级", "大二在读"],
          ["坐标", "地球 · 银河系"],
          ["状态", "保持好奇"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line/12 bg-surface/50 p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">{label}</p>
            <p className="mt-2 font-serif text-lg text-ink">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="section-label">Now</p>
          <h2 className="mt-4 font-serif text-3xl tracking-tight text-ink">现在在做什么。</h2>
          <ul className="mt-6 space-y-4 border-t border-line/10">
            {[
              ["正在构建", "这个博客，以及一些还没上线的项目"],
              ["正在学习", "Next.js、TypeScript 与可视化"],
              ["正在阅读", "《时间的秩序》与《人类简史》"],
              ["正在听", "陈奕迅、孙燕姿、Coldplay"]
            ].map(([label, text]) => (
              <li key={label} className="grid grid-cols-[80px_1fr] gap-4 border-b border-line/10 py-3 text-sm">
                <span className="font-mono text-[9px] text-faint">{label}</span>
                <span className="text-muted">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="section-label">Stack</p>
          <h2 className="mt-4 font-serif text-3xl tracking-tight text-ink">工具箱。</h2>
          <div className="mt-6 space-y-4">
            {stack.map((group) => (
              <div key={group.group} className="rounded-2xl border border-line/10 p-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-accent2">{group.group}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span key={item} className="rounded-full border border-line/12 px-2.5 py-1 font-mono text-[9px] text-muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 rounded-[26px] border border-line/12 bg-gradient-to-br from-accent/10 via-surface/40 to-accent2/10 p-7 sm:p-10">
        <p className="section-label">Contact</p>
        <h2 className="mt-4 font-serif text-3xl tracking-tight text-ink">有想法？一起聊聊。</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
          项目合作、实习机会、宇宙任务，或者只是想聊聊河海大学的食堂，都欢迎来信。
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a href={`mailto:${siteConfig.email}`} className="rounded-full bg-ink px-4 py-2 text-xs text-paper transition hover:-translate-y-0.5">
            {siteConfig.email}
          </a>
          <Link href="/links" className="rounded-full border border-line/20 px-4 py-2 text-xs text-muted transition hover:text-ink">
            友链
          </Link>
          <Link href="/rss.xml" className="rounded-full border border-line/20 px-4 py-2 text-xs text-muted transition hover:text-ink">
            RSS
          </Link>
        </div>
      </section>
    </div>
  );
}
