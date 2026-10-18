import Link from "next/link";

export const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} className="scroll-mt-28" />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} className="scroll-mt-28" />,
  a: ({ href = "", children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (href.startsWith("/")) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  img: ({ alt = "", src = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : ""}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="my-8 w-full rounded-2xl border border-line/12"
      {...props}
    />
  ),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-8 overflow-x-auto">
      <table {...props} />
    </div>
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => <hr {...props} className="my-10 border-line/15" />
};
