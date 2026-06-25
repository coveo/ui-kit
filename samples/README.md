# Coveo UI-Kit Samples

This directory contains code samples demonstrating how to use Coveo's UI-Kit libraries in various frameworks and implementation patterns.

**These samples serve a dual purpose:**

1. **Samples** — Living documentation showing how to use Coveo libraries correctly.
2. **Scaffolding starters** — The source templates for `npm create @coveo/ui`, giving developers a working project in seconds.

Because of this dual role, every sample must be **self-contained, runnable out of the box, and tested**. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full requirements.

## 📚 Sample Categories

Samples are organized by the Coveo library they use:

### [Atomic Samples](./atomic/)

Pre-built, customizable search and commerce components from `@coveo/atomic` and `@coveo/atomic-react`.

| Sample                                                       | Description                          | Framework     | Use Case          |
| ------------------------------------------------------------ | ------------------------------------ | ------------- | ----------------- |
| [search-commerce-angular](./atomic/search-commerce-angular/) | Atomic components in Angular         | Angular       | Search & Commerce |
| [search-commerce-react](./atomic/search-commerce-react/)     | Atomic React components              | React (Vite)  | Search & Commerce |
| [search-nextjs](./atomic/search-nextjs/)                     | Atomic React with Next.js App Router | Next.js       | Search            |
| [search-vuejs](./atomic/search-vuejs/)                       | Atomic components with Vue.js        | Vue.js (Vite) | Search            |

### [Headless Samples](./headless/)

Fully custom UIs built with `@coveo/headless` controllers (client-side rendering).

| Sample                                       | Description                          | Framework    | Use Case |
| -------------------------------------------- | ------------------------------------ | ------------ | -------- |
| [search-react](./headless/search-react/)     | Custom search interface with React   | React (Vite) | Search   |
| [commerce-react](./headless/commerce-react/) | Custom commerce interface with React | React (Vite) | Commerce |

### [Headless Future Samples](./thermidor/)

Samples using `@coveo/thermidor` for upcoming conversational and search experiences.

| Sample                                                | Description                                                           | Framework    | Use Case     |
| ----------------------------------------------------- | --------------------------------------------------------------------- | ------------ | ------------ |
| [conversation-react](./thermidor/conversation-react/) | React + Vite bootstrap for Headless Future conversational integration | React + Vite | Conversation |

### [Headless SSR Samples](./headless-ssr/)

Server-side rendering with Headless controllers for improved performance and SEO.

| Sample                                                         | Description                          | Framework    | Use Case |
| -------------------------------------------------------------- | ------------------------------------ | ------------ | -------- |
| [commerce-nextjs](./headless-ssr/commerce-nextjs/)             | Commerce SSR with Next.js App Router | Next.js      | Commerce |
| [commerce-nextjs-v4](./headless-ssr/commerce-nextjs-v4/)       | Commerce SSR (Headless V4 preview)   | Next.js      | Commerce |
| [search-nextjs](./headless-ssr/search-nextjs/)                 | Search SSR with Next.js App Router   | Next.js      | Search   |
| [commerce-express](./headless-ssr/commerce-express/)           | Generic SSR with Express server      | Express      | Commerce |
| [commerce-react-router](./headless-ssr/commerce-react-router/) | Commerce SSR with React Router       | React Router | Commerce |

## 🚀 Quick Start

Every sample can be run standalone:

```bash
cd samples/<category>/<sample-name>
pnpm install
pnpm dev  # or check the sample's README for the correct start command
```

No platform credentials are needed — all samples use the `searchuisamples` demo organization with a pre-configured public access token.

## 💡 Choosing the Right Approach

**Atomic** — Use when you want pre-built, customizable components with minimal code. Best for rapid implementation.

**Headless** — Use when you need full control over the UI or are integrating with an existing design system.

**Headless SSR** — Use when SEO or initial page load performance is a priority.

## 📖 Documentation

- [Coveo Atomic Documentation](https://docs.coveo.com/en/atomic/)
- [Coveo Headless Documentation](https://docs.coveo.com/en/headless/)
- [Coveo for Commerce Documentation](https://docs.coveo.com/en/coveo-for-commerce/)

## 🔗 Related Resources

- [Main Repository README](../README.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Coveo Developer Portal](https://docs.coveo.com/)
