import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';



const nextConfig: NextConfig = {
  // --- Transpile packages for bundler compatibility ---
  transpilePackages: ['gsap', '@gsap/react'],

  // --- Security ---
  poweredByHeader: false, // Remove X-Powered-By header

  // --- Image Optimization ---
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 75, 85, 90],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // --- HTTP Cache Headers (Edge Caching Strategy) ---
  async headers() {
    return [
      // ── Global security headers ──────────────────────────────────
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")' },
        ],
      },

      // ── Static pages — aggressive CDN edge cache ─────────────────
      // s-maxage: CDN caches for 1h. stale-while-revalidate: serve stale
      // for 24h while Next.js revalidates in background → zero wait on cache miss.
      {
        source: '/:path(|about|products|checkout/success)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
          { key: 'Vary', value: 'Accept-Encoding' },
        ],
      },

      // ── API routes — never cache payment or auth data ─────────────
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },

      // ── Next.js build output — immutable (content-hashed filenames) ──
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },

      // ── User-uploaded / product images ───────────────────────────
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // --- Redirects for security ---
  async redirects() {
    return [
      // Block common attack vectors
      { source: '/wp-admin', destination: '/not-found', permanent: false },
      { source: '/wp-login.php', destination: '/not-found', permanent: false },
      { source: '/.env', destination: '/not-found', permanent: false },
      { source: '/xmlrpc.php', destination: '/not-found', permanent: false },
      { source: '/admin', destination: '/not-found', permanent: false },
    ];
  },
};

// Wrap with Sentry for sourcemap upload + automatic instrumentation
// Sentry is disabled in development (see sentry.*.config.ts)
export default withSentryConfig(nextConfig, {
  // Suppresses source map uploading logs during build
  silent: true,
  // Automatically tree-shake Sentry logger statements
  disableLogger: true,
  // Upload sourcemaps only in CI/production to avoid local overhead
  automaticVercelMonitors: true,
});
