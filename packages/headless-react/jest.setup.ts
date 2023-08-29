// TODO: Remove workaround after https://github.com/coveo/ui-kit/pull/3134 is merged
import {TextDecoder, TextEncoder} from 'util';

Object.assign(global, {
  // TextDecoder/TextEncoder is not bundled with jsdom16
  // source: https://stackoverflow.com/a/68468204
  TextDecoder: TextDecoder,
  TextEncoder: TextEncoder,
});
