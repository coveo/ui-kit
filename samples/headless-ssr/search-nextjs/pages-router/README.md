# Pages router Headless SSR samples

## Config

- Following config needs to be added to `next.config.js` to workaround (temporarily) an incompatibility issue with regards to ESM.
  - This is not required if you are using the Next.js [app router](https://nextjs.org/docs/app).

next.config.js

```js
const nextConfig = {
    // Workaround for ESM incompatibility issue
    transpilePackages: ['@coveo/headless', '@coveo/headless-react'];
};
module.exports = nextConfig;
```
