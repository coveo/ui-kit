# Coveo UI-Kit Samples

This directory contains code samples demonstrating how to use Coveo's UI-Kit in various frameworks and implementation patterns. These samples are designed to help developers quickly understand and implement Coveo search and commerce experiences.

## 📚 Sample Categories

The samples are organized into three main categories based on the Coveo libraries they use:

### [Atomic Samples](./atomic/)

Samples using `@coveo/atomic` or `@coveo/atomic-react` components for pre-built, customizable search and commerce interfaces.

| Sample | Description | Framework | Use Case |
|--------|-------------|-----------|----------|
| [search-commerce-angular](./atomic/search-commerce-angular/) | Search and commerce interfaces with Atomic components in Angular | Angular | Search & Commerce |
| [search-commerce-react](./atomic/search-commerce-react/) | Multiple search and commerce interface examples with Atomic React components | React + Vite | Search & Commerce |
| [search-nextjs-app-router](./atomic/search-nextjs-app-router/) | Atomic React with Next.js App Router | Next.js (App Router) | Search |
| [search-nextjs-pages-router](./atomic/search-nextjs-pages-router/) | Atomic components with Next.js Pages Router | Next.js (Pages Router) | Search |
| [search-stencil](./atomic/search-stencil/) | Search interface built with Stencil and Atomic components | Stencil | Search |
| [search-vuejs](./atomic/search-vuejs/) | Atomic components integrated with Vue.js | Vue.js + Vite | Search |

### [Headless Samples](./headless/)

Samples using `@coveo/headless` controllers to build fully custom search and commerce interfaces.

| Sample | Description | Framework | Use Case |
|--------|-------------|-----------|----------|
| [commerce-react](./headless/commerce-react/) | Custom commerce interface using Headless commerce controllers | React | Commerce |
| [search-react](./headless/search-react/) | Custom search interface using Headless search controllers | React | Search |

### [Headless SSR Samples](./headless-ssr/)

Samples demonstrating server-side rendering (SSR) with Headless controllers for improved performance and SEO.

| Sample | Description | Framework | Use Case |
|--------|-------------|-----------|----------|
| [commerce-express](./headless-ssr/commerce-express/) | Generic SSR implementation with Express server | Express + TypeScript | Commerce |
| [commerce-nextjs](./headless-ssr/commerce-nextjs/) | Commerce SSR with Next.js App Router (current version) | Next.js (App Router) | Commerce |
| [commerce-nextjs-v4](./headless-ssr/commerce-nextjs-v4/) | Commerce SSR with Next.js App Router (preview - Headless V4) | Next.js (App Router) | Commerce |
| [commerce-react-router](./headless-ssr/commerce-react-router/) | Commerce SSR with React Router | React Router | Commerce |
| [search-nextjs](./headless-ssr/search-nextjs/) | Search SSR examples with both App Router and Pages Router | Next.js (both routers) | Search |

## 🚀 Quick Start

Each sample includes its own README with specific setup instructions. Generally, to run any sample:

```bash
# Navigate to the sample directory
cd samples/<category>/<sample-name>

# Install dependencies
npm install

# Run the development server
npm run dev
```

## 📖 Documentation

- [Coveo Atomic Documentation](https://docs.coveo.com/en/atomic/)
- [Coveo Headless Documentation](https://docs.coveo.com/en/headless/)
- [Coveo for Commerce Documentation](https://docs.coveo.com/en/coveo-for-commerce/)

## 🛠️ Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on creating and maintaining samples.

## 💡 Choosing the Right Sample

**Use Atomic samples when:**
- You want pre-built, customizable components
- You need a quick implementation with minimal custom code
- You prefer declarative component configuration

**Use Headless samples when:**
- You need complete control over the UI and behavior
- You want to build a custom design system
- You're integrating with an existing component library

**Use Headless SSR samples when:**
- SEO is a priority
- You need improved initial page load performance
- You want server-side rendering capabilities

## 🔗 Related Resources

- [Main Repository README](../README.md)
- [Coveo Developer Portal](https://docs.coveo.com/)
- [Coveo Community](https://connect.coveo.com/)
