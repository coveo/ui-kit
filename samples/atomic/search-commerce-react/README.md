# Atomic React Search & Commerce Examples

This sample project demonstrates various implementations of search and commerce interfaces using `@coveo/atomic-react` components with React and Vite. It showcases different UI patterns and component configurations.

## Features

This sample includes multiple page examples:

- **Result List**: Standard search results interface
- **Folded Result List**: Search results with grouping/folding capabilities
- **Instant Results**: Real-time search suggestions and results
- **Table Result List**: Tabular display of search results
- **Recommendations Interface**: Product/content recommendations
- **Commerce Search**: Commerce-specific search interface
- **Commerce Table Product List**: Tabular product listing
- **Commerce Recommendations**: Product recommendation interface

## Technology Stack

- **React**: UI framework
- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript
- **@coveo/atomic-react**: Coveo's React wrapper for Atomic components
- **@coveo/headless**: Coveo's headless search and commerce library

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

3. Open your browser to `http://localhost:5173`

The application will display navigation links allowing you to switch between different example pages.

## Available Scripts

```bash
npm run dev           # Start development server with hot reload
npm run build         # Build for production
npm run build:ts      # TypeScript compilation
npm run build:vite    # Vite production build
```

## Key Implementation Details

### Asset Management

This sample uses a build script to copy Atomic assets (themes, translations, icons) from the node_modules to the public directory:

```json
"build:assets": "node ../../../utils/ci/copy-files.mjs ..."
```

The assets are copied before starting the dev server to ensure all resources are available.

### Component Usage

The sample demonstrates:
- Configuring Atomic search and commerce interfaces
- Using various Atomic components (result lists, facets, search boxes, etc.)
- Implementing different UI patterns (tables, cards, recommendations)
- Managing state with Headless controllers

## Learn More

- [Atomic React Documentation](https://docs.coveo.com/en/atomic/latest/usage/atomic-react/)
- [Coveo for Commerce](https://docs.coveo.com/en/coveo-for-commerce/)
- [Headless Library](https://docs.coveo.com/en/headless/)
