// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      { 
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'v3.fal.media', // Added for Fal.ai images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ws-api.runware.ai', // Added for Runware images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'im.runware.ai', // Added for Runware images
        port: '',
        pathname: '/**',
      },
    ],
  },
  // No explicit i18n config needed here as middleware handles routing
};

export default nextConfig;
