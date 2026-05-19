import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["next-auth"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;


