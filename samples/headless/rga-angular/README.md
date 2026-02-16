# Headless RGA with Angular

This sample demonstrates a minimal set of interactions with Headless RGA in the Angular framework.

## Technology Stack

- **Angular**: UI framework
- **@coveo/headless**: Coveo's Headless library
- **TypeScript**: Type-safe JavaScript

## Prerequisites

- Node.js 22+ (LTS recommended)
- pnpm 10+

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the development server:
   ```bash
   pnpm run start
   ```

3. Open your browser to `http://localhost:5173`

## Available Scripts

```bash
pnpm run dev       # Start development server
pnpm run build     # Build for production
```


## Usage

When using the configuration from `getSampleSearchEngineConfiguration`, you will only be able to return a response for the query `what is ipx?`.
