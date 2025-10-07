import type { NextConfig } from "next";
import { DEPLOYMENT_MODE, currentConfig, isStatic } from './deploy-config.js';

// 确保使用UTC时区，与腾讯云开发环境保持一致
process.env.TZ = 'UTC';

// 将部署模式传递给前端
process.env.NEXT_PUBLIC_DEPLOYMENT_MODE = DEPLOYMENT_MODE;

console.log(`🚀 部署模式: ${DEPLOYMENT_MODE.toUpperCase()}`);

const nextConfig: NextConfig = {
  // 根据部署模式动态配置
  ...(isStatic ? {
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
  } : {
    trailingSlash: false,
    skipTrailingSlashRedirect: false,
  }),
  
  // ESLint配置
  eslint: {
    ignoreDuringBuilds: isStatic, // 静态模式时禁用ESLint
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    unoptimized: isStatic, // 静态模式时需要禁用图片优化
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
