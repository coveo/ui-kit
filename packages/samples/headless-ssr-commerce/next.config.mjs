/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/search',
        permanent: true,
      },
    ];
  },
  images: {
    domains: ['images.barca.group'],
  },
};

export default nextConfig;
