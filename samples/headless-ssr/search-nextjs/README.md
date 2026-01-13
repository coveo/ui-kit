# Headless Search SSR with Next.js

This sample demonstrates server-side rendering (SSR) with Coveo Headless search controllers using Next.js App Router. It shows how to build high-performance search experiences with improved SEO and initial load times.

## Features

- Server-side rendering for search interfaces
- Next.js App Router implementation
- Framework-agnostic `@coveo/headless/ssr` utilities
- React-specific `@coveo/headless-react/ssr` utilities
- Client-side hydration for interactive search

## Technology Stack

- **Next.js**: React framework with SSR (App Router)
- **React**: UI framework
- **@coveo/headless/ssr**: Framework-agnostic SSR utilities
- **@coveo/headless-react/ssr**: React-specific SSR utilities
- **TypeScript**: Type-safe JavaScript

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

## Project Structure

This sample contains:

- **[app-router](./app-router/)**: Next.js App Router implementation
- **[common](./common/)**: Shared code and utilities

## Getting Started

```bash
cd ./app-router
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run prod      # Start production server (run after build)
npm run e2e       # Run end-to-end tests
```

## Key Implementation Details

### Framework-Agnostic SSR

The `@coveo/headless/ssr` utilities are framework-agnostic and can be used with any SSR framework, not just Next.js. This sample uses Next.js for convenience and demonstration.

### Server-Side Rendering Benefits

SSR provides:
- Improved initial page load performance
- Better SEO with pre-rendered search content
- Enhanced Core Web Vitals
- Progressive enhancement

## Learn More

- [Coveo Headless SSR Documentation](https://docs.coveo.com/en/headless/latest/usage/ssr/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/react/use-server)
