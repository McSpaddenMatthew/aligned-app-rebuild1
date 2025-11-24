/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TEMP: allow builds even if TypeScript has errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // TEMP: allow builds even if ESLint has errors
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
