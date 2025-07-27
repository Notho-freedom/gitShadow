/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configuration pour les pages dynamiques
  async rewrites() {
    return [
      {
        source: '/pricing',
        destination: '/pricing',
        has: [
          {
            type: 'header',
            key: 'x-vercel-deployment-url',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 