import type { NextConfig } from "next";

// @ts-ignore
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // @ts-ignore
  turbopack: {}
};

export default withPWA(nextConfig);
