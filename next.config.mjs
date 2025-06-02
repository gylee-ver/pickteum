/** @type {import('next').NextConfig} */
const BASE_URL = 'https://www.pickteum.com'

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.pickteum.com',
      },
      {
        protocol: 'https',
        hostname: 'pickteum.com',
      },
      {
        protocol: 'https',
        hostname: 'jpdjalmsoooztqvhuzyx.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'pickteum.com',
          },
        ],
        destination: 'https://www.pickteum.com/:path*',
        permanent: true,
      },
      {
        source: '/category/health',
        destination: '/category/건강',
        permanent: true,
      },
      {
        source: '/category/sports',
        destination: '/category/스포츠',
        permanent: true,
      },
      {
        source: '/category/politics',
        destination: '/category/정치/시사',
        permanent: true,
      },
      {
        source: '/category/economy',
        destination: '/category/경제',
        permanent: true,
      },
      {
        source: '/category/lifestyle',
        destination: '/category/라이프',
        permanent: true,
      },
      {
        source: '/category/tech',
        destination: '/category/테크',
        permanent: true,
      },
      {
        source: '/category/life',
        destination: '/category/라이프',
        permanent: true,
      },
      {
        source: '/category/technology',
        destination: '/category/테크',
        permanent: true,
      },
      {
        source: '/category/business',
        destination: '/category/경제',
        permanent: true,
      },
      {
        source: '/category/news',
        destination: '/category/정치/시사',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
