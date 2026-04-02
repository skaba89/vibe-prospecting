import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow cross-origin requests from preview
  allowedDevOrigins: [
    'preview-chat-21eaf496-4b04-462b-8b12-4008ce419ce2.space.z.ai',
    '.space.z.ai',
    '.z.ai'
  ],
};

export default nextConfig;
