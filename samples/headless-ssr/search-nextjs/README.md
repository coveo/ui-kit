# Headless Search SSR with Next.js

This sample demonstrates server-side rendering (SSR) with Coveo Headless search controllers using Next.js App Router. It shows how to build high-performance search experiences with improved SEO and initial load times.

## Features

- Server-side rendering for search interfaces
- Next.js App Router implementation
- Framework-agnostic example using `@coveo/headless/ssr` utilities (`/generic` route)
- React-specific example using `@coveo/headless-react/ssr` utilities (`/react` route)
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

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000/generic](http://localhost:3000/generic) for the framework-agnostic example or [http://localhost:3000/react](http://localhost:3000/react) for the React-specific example.

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run prod      # Start production server (run after build)
npm run lint      # Lint the code
npm run e2e       # Run end-to-end tests
npm run e2e:watch # Run end-to-end tests in watch mode
```

## Key Implementation Details

### Two Example Implementations

This sample includes two routes:

- **`/generic`**: Framework-agnostic implementation using `@coveo/headless/ssr`
- **`/react`**: React-specific implementation using `@coveo/headless-react/ssr`

Both demonstrate server-side rendering with Coveo Headless controllers.

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
