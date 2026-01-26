# Coveo Atomic React with Next.js App Router

This sample demonstrates how to use `@coveo/atomic-react` components with Next.js App Router.

## Setup Requirements

To make atomic-react work with Next.js App Router, you need these 3 configurations:

### 1. Next.js Configuration

Add `transpilePackages` to your `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@coveo/atomic-react', '@coveo/atomic'],
};

export default nextConfig;
```

### 2. Copy Assets

Add this script to your `package.json` to copy required assets:

```json
{
  "scripts": {
    "build:assets": "ncp node_modules/@coveo/atomic-react/dist/assets public/assets && ncp node_modules/@coveo/atomic-react/dist/lang public/lang"
  }
}
```

Run it before starting your app:
```bash
pnpm run build:assets
```

### 3. Import Styles

Add the atomic styles to your `app/layout.tsx`:

```tsx
import '@coveo/atomic/themes/coveo.css';
```

## Getting Started

1. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

That's it! You can now use Coveo Atomic React components in your Next.js app.
