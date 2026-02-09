import type { NextConfig } from "next";

// @ts-ignore
const runtimeCaching = require("next-pwa/cache");

runtimeCaching.unshift({
  urlPattern: /manifest\.webmanifest$/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'manifest',
    expiration: {
      maxEntries: 1,
      maxAgeSeconds: 24 * 60 * 60, // 24 hours
    },
  },
});

runtimeCaching.unshift({
  urlPattern: /\/_next\/image\?url/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'next-image',
    expiration: {
      maxEntries: 64,
      maxAgeSeconds: 24 * 60 * 60, // 24 hours
    },
  },
});

// Cache RSC Payloads
runtimeCaching.unshift({
  urlPattern: /\?_rsc=/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'pages-rsc',
    expiration: {
      maxEntries: 32,
      maxAgeSeconds: 24 * 60 * 60, // 24 hours
    },
  },
});

// Cache Page Navigations (HTML)
runtimeCaching.unshift({
  urlPattern: ({ request, url: { pathname }, sameOrigin }) => {
    if (!sameOrigin || pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/static/')) {
      return false;
    }
    return request.mode === 'navigate';
  },
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'pages',
    expiration: {
      maxEntries: 32,
      maxAgeSeconds: 24 * 60 * 60, // 24 hours
    },
  },
});

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
