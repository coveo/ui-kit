# Headless RGA with React

This sample demonstrates a minimal set of interactions with Headless RGA in a React framework.

## Technology Stack

- **React**: UI framework
- **@coveo/headless**: Coveo's Headless library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server

## Prerequisites

- Node.js 22+ (LTS recommended)
- pnpm 10+

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the project:
   ```bash
   pnpm run build
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Available Scripts

```bash
pnpm run dev       # Start development server
pnpm run build     # Build for production
```

## Usage

When using the configuration from `getSampleSearchEngineConfiguration`, you will only be able to return a response for the query `what is ipx?`.
