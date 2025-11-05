# Atomic with Stencil

This sample demonstrates how to integrate Coveo Atomic search components within a Stencil application. It shows how to use Atomic web components in a Stencil-based project with routing and custom component integration.

## Features

- Integration of `@coveo/atomic` components in a Stencil application
- Custom Stencil components wrapping Atomic functionality
- Client-side routing with stencil-router-v2
- Search page with facets, results, and pagination
- Custom result rendering components

## Technology Stack

- **Stencil**: Web component compiler
- **@coveo/atomic**: Coveo's web component library
- **@coveo/headless**: Coveo's headless search library
- **stencil-router-v2**: Routing library for Stencil

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

3. Open your browser to `http://localhost:3666`

## Available Scripts

```bash
npm run dev         # Start development server with watch mode
npm run build       # Build for production
npm run e2e:watch   # Run Cypress tests in interactive mode
```

## Key Implementation Details

### Stencil Integration

This sample demonstrates:
- Using Atomic web components within Stencil components
- Creating custom Stencil components that interact with Atomic components
- Managing search state through Stencil's reactive properties
- Implementing custom result templates

### Component Architecture

The sample includes:
- `app-root`: Main application component with routing
- `search-page`: Search interface page component
- `results-manager`: Component for managing search results display
- `standalone-search-box`: Reusable search box component
- Custom result components for specialized rendering

### Routing

Uses stencil-router-v2 for client-side navigation between different pages/views.

## Learn More

- [Stencil Documentation](https://stenciljs.com/docs/introduction)
- [Atomic Documentation](https://docs.coveo.com/en/atomic/)
- [Coveo Headless](https://docs.coveo.com/en/headless/)
