import type { NextConfig } from "next";

process.env.TZ = 'UTC';

// 使用动态服务器模式以支持 API 路由和支付功能
// 注意：支付功能需要运行在 Node.js 服务器上
const isStatic = false;

console.log(`🚀 部署模式: DYNAMIC (支持 API 和支付)`);

const nextConfig: NextConfig = {
  // 静态导出配置，适合Vercel自动部署
  // output: 'export', // 注释掉此行以启用默认的Node.js服务器模式
  // trailingSlash: true, // 在非静态模式下通常不需要
  // skipTrailingSlashRedirect: true, // 在非静态模式下通常不需要
  
  // ESLint配置
  eslint: {
    ignoreDuringBuilds: true, // 静态模式时禁用ESLint
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    unoptimized: false, // 在Node.js服务器模式下启用图片优化
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
              value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.creem.io https://test-api.creem.io https://checkout.creem.io; frame-src https://checkout.creem.io;",
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
