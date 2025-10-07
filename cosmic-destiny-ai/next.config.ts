import type { NextConfig } from "next";

// 确保使用UTC时区，与腾讯云开发环境保持一致
process.env.TZ = 'UTC';

// 默认使用静态模式，适合Vercel自动部署
const isStatic = true;

console.log(`🚀 部署模式: STATIC (默认)`);

const nextConfig: NextConfig = {
  // 静态导出配置，适合Vercel自动部署
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // ESLint配置
  eslint: {
    ignoreDuringBuilds: true, // 静态模式时禁用ESLint
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    unoptimized: true, // 静态模式时需要禁用图片优化
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Bundle optimization
  experimental: {
    optimizePackageImports: ['lucide-react', 'three'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Production only headers
          ...(process.env.NODE_ENV === 'production' ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains',
            },
            {
              key: 'Content-Security-Policy',
              value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';",
            },
          ] : []),
        ],
      },
    ]
  },

  // Redirects for SEO
  async redirects() {
    return [
      // Removed problematic dashboard redirect
    ]
  },
};

export default nextConfig;
