import {http, HttpResponse} from 'msw';
import {setupWorker} from 'msw/browser';
import {expect, test, describe, vi} from 'vitest';
import './atomic-text';

const handlers = [
  http.get('*/headless/dist/browser/headless.esm.js?**', () => {
    return new HttpResponse(
      `
      export function getSampleSearchEngineConfiguration() {
        return {
          organizationId: 'mock-org-id',
          accessToken: 'mock-access-token',
        };
      }
    `,
      {
        headers: {
          'Content-Type': 'application/javascript',
        },
      }
    );
  }),
];

const worker = setupWorker();

vi.mock('../../../utils/initialization-lit-utils.js', () => ({
  initializeBindings: vi.fn(() =>
    Promise.resolve({
      i18n: {
        t: (key: string, options: {count?: number}) =>
          `${key}${options?.count ? ` (count: ${options.count})` : ''}`,
        on: vi.fn(),
        off: vi.fn(),
      },
    })
  ),
}));

vi.mock('@coveo/headless', () => ({
  getSampleSearchEngineConfiguration: vi.fn(() => ({
    organizationId: 'mock-org-id',
    accessToken: 'sd',
  })),
}));

vi.mock('./boot.js', () => ({
  returnBoot: vi.fn(() => 'mock-boot'),
}));

describe('atomic-text', async () => {
  await worker.start();
  worker.use(...handlers);

  worker.events.on('request:start', (req) => {
    console.log(`Fetch initiated: ${req.request.url}`);
  });

  worker.events.on('request:match', (req) => {
    console.log(`Request matched a handler: ${req.request.url}`);
  });

  worker.events.on('request:unhandled', (req) => {
    console.warn(`Unhandled request: ${req.request.url}`);
  });

  test('should render correctly', () => {
    const parent = document.createElement('atomic-search-interface');

    const atomicText = document.createElement('atomic-text');
    atomicText.value = 'Hello ';

    parent.appendChild(atomicText);
    document.body.appendChild(parent);

    expect(parent).toBeInTheDocument();
    expect(atomicText.shadowRoot?.innerHTML).toContain('mock-org-id');
  });
});
