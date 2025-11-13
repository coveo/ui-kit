# Headless Search SSR - Pages Router Implementation

This is the Next.js Pages Router implementation of the Headless Search SSR sample. See the [parent README](../README.md) for more context about this sample.

## Configuration

When using Headless SSR with Next.js Pages Router, you need to add configuration to work around an ESM incompatibility:

### next.config.js

```js
const nextConfig = {
  // Workaround for ESM incompatibility issue
  transpilePackages: ['@coveo/headless', '@coveo/headless-react'],
};
module.exports = nextConfig;
```

> **Note**: This configuration is not required when using the Next.js App Router.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run prod      # Start production server
npm run e2e       # Run end-to-end tests
```

## Learn More

- See the [parent README](../README.md) for complete documentation
- [Next.js Pages Router Documentation](https://nextjs.org/docs/pages)
