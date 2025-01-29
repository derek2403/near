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
    // Modify chunk loading
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          // common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      }
    };

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
