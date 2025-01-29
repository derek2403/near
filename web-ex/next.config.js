/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix: '.',
  basePath: '',
  trailingSlash: false,
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      path: false 
    };
    return config;
  },
  // Update exportPathMap
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/createWallet': { page: '/createWallet' },
      '/login': { page: '/login' },
      '/dashboard': { page: '/dashboard' },
      '/settings': { page: '/settings' },
      '/send': { page: '/send' }
    };
  }
}

module.exports = nextConfig
