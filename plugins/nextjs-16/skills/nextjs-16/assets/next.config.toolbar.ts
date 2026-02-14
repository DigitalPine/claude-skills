import type { NextConfig } from 'next';
import createWithVercelToolbar from '@vercel/toolbar/plugins/next';

const nextConfig: NextConfig = {
  // Your existing config...
};

// Wrap config with Vercel Toolbar plugin for development
const withVercelToolbar = createWithVercelToolbar();
export default withVercelToolbar(nextConfig);
