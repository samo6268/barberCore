const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 's3.ir-thr-at1.arvanstorage.ir' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
    ],
  },
  // RTL + Farsi locale
  i18n: {
    locales: ['fa'],
    defaultLocale: 'fa',
  },
  // Transpile packages/ui
  transpilePackages: ['@barbercore/ui'],
  webpack(config) {
    const path = require('path');
    config.resolve.alias['@ui'] = path.resolve(__dirname, '../../packages/ui/src');
    return config;
  },
};

module.exports = withPWA(nextConfig);
