/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/search',
        permanent: true, // Set to false if you want a temporary redirect
      },
    ];
  },
};

export default nextConfig;
