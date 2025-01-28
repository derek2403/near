/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true
  },
  assetPrefix: '.',
  trailingSlash: true,
  distDir: 'build',
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  },
  pageExtensions: ['js', 'jsx'],
}

module.exports = nextConfig 