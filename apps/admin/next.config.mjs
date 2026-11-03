/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@barbercore/ui', '@adaptive-assistant/core', '@adaptive-assistant/react'],
  async rewrites() {
    const origin = (process.env.ASSISTANT_API_ORIGIN || 'http://127.0.0.1:4000').replace(/\/$/, '');
    return [{ source: '/api/v1/assistant/:path*', destination: `${origin}/api/v1/assistant/:path*` }];
  },
};

export default nextConfig;
