# Headless Commerce SSR Generic Sample

## Purpose

This sample demonstrates server-side rendering (SSR) with Coveo Headless commerce controllers using a generic implementation. It shows how to:

- Set up a commerce search interface with server-side rendering
- Use Headless controllers for product search and listing
- Implement a simple search interface with plain HTML/CSS/JS
- Handle search state on both server and client sides

## Prerequisites

- Node.js 22+ (LTS v22.18.0)
- npm 10+

## Key Features

- **Server-side rendering**: Initial page load with pre-rendered search results
- **Client-side hydration**: Interactive search functionality after page load
- **esbuild bundling**: Fast and efficient bundling for the client-side code
- **TypeScript**: Full type safety throughout the application
- **Express server**: Simple HTTP server for handling requests

## Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:3000`

## Development

For development with automatic rebuilding:

```bash
npm run dev
```

This will start the client bundler in watch mode and run the server with hot reload using tsx.


## Testing

```bash
npm run test
```

Runs the Playwright end-to-end tests.


```bash
npm run test:headed
```

Runs the Playwright tests in headed mode (with a visible browser).


