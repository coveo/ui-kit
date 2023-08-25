import {TextDecoder, TextEncoder} from 'util';

Object.assign(global, {
  // TextDecoder/TextEncoder is not bundled with jsdom16
  // source: https://stackoverflow.com/a/68468204
  TextDecoder: TextDecoder,
  TextEncoder: TextEncoder,
});
