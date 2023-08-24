const util = require('util');

Object.assign(global, {
  // TextDecoder/TextEncoder is not bundled with jsdom16
  // source: https://stackoverflow.com/a/68468204
  TextDecoder: util.TextDecoder,
  TextEncoder: util.TextEncoder,
});
