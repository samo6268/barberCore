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
    domains: ['s3.ir-thr-at1.arvanstorage.ir'],
  },
  // RTL + Farsi locale
  i18n: {
    locales: ['fa'],
    defaultLocale: 'fa',
  },
};

module.exports = withPWA(nextConfig);
