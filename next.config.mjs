// next.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['viem', 'wagmi', 'connectkit'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'viem': path.resolve(__dirname, 'node_modules/viem'),
    };
    return config;
  },
}

export default nextConfig;