/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compiling of common components between app and pages router outside `src/`.
  transpilePackages: ['@coveo/headless-ssr-samples-common'],
  reactStrictMode: true,
};

module.exports = nextConfig;
