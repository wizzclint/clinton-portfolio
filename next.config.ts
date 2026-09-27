import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let the dev server be opened from other devices on the local network
  // (e.g. http://192.168.1.193:3000 on your phone). Without this, Next.js
  // blocks the page's JavaScript and nothing interactive works.
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
