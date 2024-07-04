/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true,
    },
    async rewrites() {
      return [
        {
          source: '/api/auth/:path*',
          destination: '/api/auth/:path*',
        },
      ]
    },
  }
  
  export default nextConfig;