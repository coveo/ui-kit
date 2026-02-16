# Headless Commerce SSR with Next.js

This sample demonstrates server-side rendering (SSR) with Coveo Headless commerce controllers using Next.js App Router. It shows how to build a high-performance e-commerce search experience with improved SEO and initial load times.

## Features

- Server-side rendering for commerce search and product listings
- Next.js App Router architecture
- Headless commerce controllers for product search
- Client-side hydration for interactive features
- SEO-optimized product pages

## Technology Stack

- **Next.js**: React framework with SSR (App Router)
- **React**: UI framework
- **@coveo/headless-react/ssr-commerce**: Coveo's SSR commerce utilities
- **TypeScript**: Type-safe JavaScript

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

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
npm run prod      # Start production server (run after build)
```

## Key Implementation Details

### Server-Side Rendering

This sample demonstrates:
- Rendering product listings on the server for improved initial page load
- Hydrating Headless controllers on the client for interactivity
- Using `@coveo/headless-react/ssr-commerce` utilities for SSR support
- Managing search state across server and client

### Next.js App Router

The sample uses Next.js App Router features:
- Server Components for initial rendering
- Client Components for interactive features
- React Server Components architecture
- Streaming and progressive enhancement

### Performance Benefits

SSR provides:
- Faster initial page loads
- Better SEO through pre-rendered content
- Improved Core Web Vitals
- Progressive enhancement

## Learn More

- [Coveo Headless SSR Documentation](https://docs.coveo.com/en/headless/latest/usage/ssr/)
- [Coveo for Commerce](https://docs.coveo.com/en/coveo-for-commerce/)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/react/use-server)
