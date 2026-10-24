import type { NextConfig } from "next";

// Baseline security headers (HSTS is already added by Vercel)
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '16mb',
    },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
};

export default nextConfig;
