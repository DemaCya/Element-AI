/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for serverless deployment
  images: {
    unoptimized: true
  },
  // Experimental features for better compatibility
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js']
  }
}

export default nextConfig