/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  env: {
    // Only enable developer mode when explicitly set to 'true' in .env / .env.local
    DEVELOPER_MODE: process.env.DEVELOPER_MODE === 'true' ? 'true' : 'false',
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
