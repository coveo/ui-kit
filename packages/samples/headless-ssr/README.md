# Server side rendering examples

- Demonstrates usage of the framework agnostic `@coveo/headless/ssr` and React specific `@coveo/headless-react/ssr` utils for Server-Side Rendering with headless using Next.js [app router](https://nextjs.org/docs/app) and [pages router](https://nextjs.org/docs/pages).
  - The files common between both pages and app router are placed in [./common](./common/).
- Although Next.js is used to demonstrate SSR usage for convenience, the utils are not specific to Next.js.

## Getting Started

- Choose either [./pages-router](./pages-router/) or [./app-router](./app-router/)

  - `cd ./pages-router` OR
  - `cd ./app-router`

- Run dev server

```bash
npm run dev
```

- Run prod

```bash
npm run build && npm run prod
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- Run tests

```bash
npm run e2e
```

Note: This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
