/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable reuse of components outside `src/`
    externalDir: true,
  },
};

module.exports = nextConfig;
