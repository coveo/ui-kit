# Atomic Search & Commerce with Angular

This sample demonstrates how to integrate Coveo Atomic components into an Angular application for building search and commerce experiences.

## Features

- Integration of `@coveo/atomic` web components in Angular
- Search and commerce interface examples
- Angular component wrappers for Atomic elements
- Proper integration with Angular's change detection

## Technology Stack

- **Angular**: Web application framework (v13.1.4+)
- **@coveo/atomic**: Coveo's web component library
- **TypeScript**: Type-safe JavaScript
- **Angular CLI**: Angular development tooling

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

3. Open your browser to `http://localhost:4200/`

The app will automatically reload when you make changes to the source files.

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production (outputs to dist/)
```

## Key Implementation Details

### Angular Integration

To use Atomic web components in Angular, you need to:

1. Import the Atomic loader in your main TypeScript file
2. Configure Angular to recognize custom elements with the `CUSTOM_ELEMENTS_SCHEMA`
3. Initialize Atomic components after Angular bootstraps

This sample demonstrates the proper setup and best practices for integrating Coveo's web components within Angular's component architecture.

## Learn More

- [Angular Documentation](https://angular.io/docs)
- [Angular CLI Reference](https://angular.io/cli)
- [Atomic Documentation](https://docs.coveo.com/en/atomic/)
- [Integrating Atomic with Angular](https://docs.coveo.com/en/atomic/latest/usage/)
