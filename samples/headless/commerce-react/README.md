# Headless Commerce with React

This sample demonstrates how to build a custom commerce interface using `@coveo/headless/commerce` controllers with React. It shows how to create a fully customized e-commerce search and product listing experience.

## Features

- Custom commerce search interface with Headless controllers
- Product listing pages
- Faceted navigation
- Custom product cards and result templates
- State management using Headless commerce engine

## Technology Stack

- **React**: UI framework
- **@coveo/headless/commerce**: Coveo's headless commerce library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
```

## Key Implementation Details

### Headless Commerce Controllers

This sample demonstrates how to:
- Initialize a Headless commerce engine
- Use commerce-specific controllers (product listing, search, recommendations)
- Implement product facets and filters
- Handle product search and discovery
- Create custom product result templates

### Custom Commerce UI

This sample provides complete control over your commerce interface:
- Custom product card layouts
- Branded search experience
- Tailored filtering and sorting options
- Integration with your e-commerce design system

### State Management

The sample uses Headless controllers to manage:
- Product search state
- Facet selections
- Pagination
- Sort order
- Search query

## Learn More

- [Coveo Headless Commerce Documentation](https://docs.coveo.com/en/headless/latest/usage/commerce/)
- [Coveo for Commerce](https://docs.coveo.com/en/coveo-for-commerce/)
- [React Documentation](https://reactjs.org/)
