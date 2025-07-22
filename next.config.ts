import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' 'unsafe-eval'; object-src 'none';",
          },
        ],
      },
    ];
  },
  // other config options here...
};

export default nextConfig;

