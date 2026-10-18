/** @type {import('next').NextConfig} */
const standalone = process.env.BUILD_STANDALONE === "true";
const cloudflare = process.env.BUILD_CLOUDFLARE === "true";

const nextConfig = {
  reactStrictMode: true,
  ...(standalone ? { output: "standalone" } : {}),
  ...(cloudflare ? { output: "export", trailingSlash: true } : {}),
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    ...(cloudflare ? { unoptimized: true } : {})
  },
  ...(cloudflare ? {} : { async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          }
        ]
      }
    ];
  } })
};

export default nextConfig;
