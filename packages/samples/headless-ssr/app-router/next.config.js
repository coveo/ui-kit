/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable access of common components between app and pages router outside `src/`.
    //  The other alternative is to move common components into its own package but it would reduce readability.
    //  Since readability is more important for the samples, this setting is used instead.
    externalDir: true,
  },
};

module.exports = nextConfig;
