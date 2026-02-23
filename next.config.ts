import type { NextConfig } from "next";



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

  // --- Security Headers ---
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [

          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Clickjacking protection
          { key: 'X-Frame-Options', value: 'DENY' },
          // XSS protection (legacy browsers)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // HSTS
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Permissions policy (Updated to allow Stripe)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/images/(.*)',
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

export default nextConfig;
