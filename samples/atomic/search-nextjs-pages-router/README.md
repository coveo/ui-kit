# Atomic with Next.js Pages Router

This sample demonstrates how to integrate Coveo Atomic components with Next.js using the Pages Router. It shows the proper setup for using Atomic web components in a Next.js server-side rendered application.

## Features

- Integration of `@coveo/atomic` components with Next.js Pages Router
- Server-side rendering (SSR) compatible setup
- Client-side hydration of Atomic components
- Proper configuration for Next.js API routes

## Technology Stack

- **Next.js**: React framework with SSR (Pages Router)
- **React**: UI framework
- **@coveo/atomic**: Coveo's web component library
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

The page will automatically update as you edit files.

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server (run after build)
```

## Key Implementation Details

### Next.js Pages Router Configuration

When using Atomic with Next.js Pages Router, ensure:

1. Atomic components are only initialized on the client side (not during SSR)
2. Dynamic imports are used where necessary to prevent SSR issues
3. The custom elements are properly registered before use

### Pages and API Routes

- The `pages/` directory contains your page components
- The `pages/api/` directory contains API routes
- Edit `pages/index.tsx` to modify the main search page

This sample demonstrates the proper setup for integrating Coveo's web components with Next.js's Pages Router architecture.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Pages Router](https://nextjs.org/docs/pages)
- [Atomic Documentation](https://docs.coveo.com/en/atomic/)
- [Deploying Next.js](https://nextjs.org/docs/deployment)
