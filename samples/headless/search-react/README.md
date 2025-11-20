# Headless Search with React

This sample demonstrates how to build a custom search interface using `@coveo/headless` controllers with React. It shows how to create a fully custom UI while leveraging Coveo's headless search capabilities.

## Features

- Custom search interface built with Headless controllers
- React components for search box, facets, results, and more
- State management using Headless engine
- Custom styling and UI components
- Server-side rendering (SSR) support

## Technology Stack

- **React**: UI framework
- **@coveo/headless**: Coveo's headless search library
- **TypeScript**: Type-safe JavaScript
- **Create React App**: React application setup

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

The page will reload when you make edits, and you'll see any lint errors in the console.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run prod:ssr     # Start production server with SSR
npm test             # Run tests in interactive watch mode
```

## Key Implementation Details

### Headless Controllers

This sample demonstrates how to:
- Initialize a Headless search engine
- Create and manage controllers for different search features (search box, facets, results, etc.)
- Subscribe to state changes and update the UI
- Implement custom UI components that interact with Headless controllers

### Server-Side Rendering (SSR)

To run the application with server-side rendering:

1. Build the app and server:
   ```bash
   npm run build
   ```

2. Start the SSR server:
   ```bash
   npm run prod:ssr
   ```

This approach pre-renders the search interface on the server for improved initial load performance and SEO.

### Custom UI

Unlike Atomic components, this sample gives you complete control over:
- Component structure and styling
- User interactions and behavior
- Integration with your design system
- Custom business logic

## Learn More

- [Coveo Headless Documentation](https://docs.coveo.com/en/headless/)
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Documentation](https://reactjs.org/)
