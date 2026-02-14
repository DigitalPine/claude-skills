/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds since using Biome
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
