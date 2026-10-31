/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/v2/:path*",
        destination: process.env.API_INTERNAL_URL 
          ? `${process.env.API_INTERNAL_URL}/api/v2/:path*` 
          : "http://127.0.0.1:8000/api/v2/:path*",
      },
    ];
  },
};

export default nextConfig;
