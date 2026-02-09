import type { NextConfig } from "next";

// @ts-ignore
const runtimeCaching = require("next-pwa/cache");

// @ts-ignore
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // @ts-ignore
  turbopack: {}
};

export default withPWA(nextConfig);
