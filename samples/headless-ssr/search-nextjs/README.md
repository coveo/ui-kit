# Headless Search SSR with Next.js

This sample demonstrates server-side rendering (SSR) with Coveo Headless search controllers using both Next.js App Router and Pages Router. It shows how to build high-performance search experiences with improved SEO and initial load times.

## Features

- Server-side rendering for search interfaces
- Examples for both Next.js App Router and Pages Router
- Framework-agnostic `@coveo/headless/ssr` utilities
- React-specific `@coveo/headless-react/ssr` utilities
- Client-side hydration for interactive search

## Technology Stack

- **Next.js**: React framework with SSR
- **React**: UI framework
- **@coveo/headless/ssr**: Framework-agnostic SSR utilities
- **@coveo/headless-react/ssr**: React-specific SSR utilities
- **TypeScript**: Type-safe JavaScript

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

## Project Structure

This sample contains two implementations:

- **[pages-router](./pages-router/)**: Next.js Pages Router implementation
- **[app-router](./app-router/)**: Next.js App Router implementation
- **[common](./common/)**: Shared code between both implementations

## Getting Started

Choose either the Pages Router or App Router implementation:

### Using Pages Router

```bash
cd ./pages-router
npm install
npm run dev
```

### Using App Router

```bash
cd ./app-router
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts (in each subdirectory)

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run prod      # Start production server (run after build)
npm run e2e       # Run end-to-end tests
```

## Key Implementation Details

### Framework-Agnostic SSR

The `@coveo/headless/ssr` utilities are framework-agnostic and can be used with any SSR framework, not just Next.js. This sample uses Next.js for convenience and demonstration.

### Pages Router vs App Router

Both implementations demonstrate the same functionality but use different Next.js routing paradigms:

- **Pages Router**: Traditional Next.js routing with `pages/` directory
- **App Router**: Modern Next.js routing with `app/` directory and React Server Components

### Server-Side Rendering Benefits

SSR provides:
- Improved initial page load performance
- Better SEO with pre-rendered search content
- Enhanced Core Web Vitals
- Progressive enhancement

## Learn More

- [Coveo Headless SSR Documentation](https://docs.coveo.com/en/headless/latest/usage/ssr/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Pages Router](https://nextjs.org/docs/pages)
- [React Server Components](https://react.dev/reference/react/use-server)
