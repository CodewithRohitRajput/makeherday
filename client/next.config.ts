import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // VS Code port-forwarding tunnels, used to test Cashfree checkout locally.
  allowedDevOrigins: ["**.devtunnels.ms"],
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
