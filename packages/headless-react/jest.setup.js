import {randomBytes} from 'crypto';
import {TextEncoder, TextDecoder} from 'util';

Object.assign(global, {
  // TextDecoder/TextEncoder is not bundled with jsdom16
  // source: https://stackoverflow.com/a/68468204
  TextDecoder,
  TextEncoder,
  // Need a polyfill for `getRandomValues` for coveo.analytics.js to work correctly in a node < v18 environment.
  // source: https://stackoverflow.com/a/67332178/8055339
  crypto: {getRandomValues: (arr) => randomBytes(arr.length)},
});
