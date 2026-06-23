import {test as base, expect} from '@chromatic-com/playwright';
import {defineNetworkFixture, type NetworkFixture} from '@msw/playwright';
import {
  MockSearchApi,
  MockCommerceApi,
  MockInsightApi,
} from '@coveo/platform-mock-api';
import type {HttpHandler} from 'msw';

const COMMIT_SHA = process.env.COMMIT_SHA;
const BASE_URL = COMMIT_SHA
  ? `https://static.cloud.coveo.com/atomic/commit/${COMMIT_SHA}/v3`
  : 'https://static.cloud.coveo.com/atomic/v3';
const ATOMIC_URL = `${BASE_URL}/atomic.esm.js`;
const THEME_URL = `${BASE_URL}/themes/coveo.css`;

export {expect};

export const searchApi = new MockSearchApi();
export const commerceApi = new MockCommerceApi();
export const insightApi = new MockInsightApi();

interface Fixtures {
  network: NetworkFixture;
  useHandlers: (handlers: HttpHandler[]) => Promise<void>;
}

export const test = base.extend<Fixtures>({
  network: [
    async ({context}, use) => {
      const network = defineNetworkFixture({
        context: context as any,
        handlers: [],
      });
      await network.enable();
      await use(network);
      await network.disable();
    },
    {auto: true},
  ],
  useHandlers: async ({network}, use) => {
    await use(async (handlers: HttpHandler[]) => {
      network.use(...handlers);
    });
  },
});

export function pageHtml(body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="${THEME_URL}">
  <script type="module" src="${ATOMIC_URL}"></script>
  <style>body { margin: 0; font-family: system-ui, sans-serif; }</style>
</head>
<body>${body}</body>
</html>`;
}
