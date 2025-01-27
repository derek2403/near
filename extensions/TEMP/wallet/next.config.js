/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // These settings are crucial for Chrome extension
  assetPrefix: '',
  basePath: '',
  distDir: 'out',
  // Remove experimental config
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
}

module.exports = nextConfig 