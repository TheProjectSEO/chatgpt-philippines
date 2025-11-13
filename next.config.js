/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Skip static optimization for pages with dynamic features
  experimental: {
    isrFlushToDisk: false,
  },
}

module.exports = nextConfig
