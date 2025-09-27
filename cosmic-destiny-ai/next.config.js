/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation for pages that use authentication
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  }
}

export default nextConfig