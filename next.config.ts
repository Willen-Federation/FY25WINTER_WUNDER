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
  urlPattern: ({ request, url }: { request: Request; url: URL }) => {
    const isSameOrigin = self.location.origin === url.origin;

    if (!isSameOrigin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/') || url.pathname.startsWith('/static/')) {
      return false;
    }
    // Exclude RSC requests (they have their own cache rule)
    if (url.searchParams.has('_rsc')) {
      return false;
    }
    // Cache all other same-origin requests to page routes (HTML), allowing background fetch to warm the cache
    return true;
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
