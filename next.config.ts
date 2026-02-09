import type { NextConfig } from "next";

// @ts-ignore
const runtimeCaching = require("next-pwa/cache");

const customCacheRules = [
  // 1. Cache RSC Payloads (High Priority)
  {
    urlPattern: /\?_rsc=/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'pages-rsc',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  },
  // 2. Cache Next.js Images
  {
    urlPattern: /\/_next\/image\?url/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'next-image',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  },
  // 3. Cache Manifest
  {
    urlPattern: /manifest\.webmanifest$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'manifest',
      expiration: {
        maxEntries: 1,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      },
    },
  },
  // 4. Cache Page Navigations (HTML) - Must be after RSC to avoid capturing RSC requests
  {
    urlPattern: ({ request, url }: { request: Request; url: URL }) => {
      // Must be same-origin
      if (self.location.origin !== url.origin) return false;

      // Exclude API, Next internals, Static files
      if (url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/_next/') ||
        url.pathname.startsWith('/static/')) {
        return false;
      }

      // Exclude RSC (handled by rule above, but redundancy is safe)
      if (url.searchParams.has('_rsc')) return false;

      // Match navigation requests (HTML)
      return request.mode === 'navigate';
    },
    handler: 'StaleWhileRevalidate', // Retain SWR for offline speed
    options: {
      cacheName: 'pages',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  }
];

// Add custom rules to the beginning of the runtimeCaching array
runtimeCaching.unshift(...customCacheRules);

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
