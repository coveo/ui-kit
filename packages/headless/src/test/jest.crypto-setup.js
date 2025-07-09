// Need a polyfill for `getRandomValues` for coveo.analytics.js to work correctly in a node < v18 environment.
// source: https://stackoverflow.com/a/67332178/8055339
global.crypto = {
  getRandomValues: (arr) => require('node:crypto').randomBytes(arr.length),
};
