import {abortableFetch as abortableFetchFactory} from 'abortcontroller-polyfill/dist/cjs-ponyfill';

export {
  AbortController,
  AbortSignal,
} from 'abortcontroller-polyfill/dist/cjs-ponyfill';

const {fetch: abortableFetch} = abortableFetchFactory({
  fetch,
});

export {abortableFetch as fetch};
