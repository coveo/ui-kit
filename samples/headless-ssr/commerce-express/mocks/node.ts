import {MockCommerceApi} from '@coveo/platform-mock-api';
import {setupServer} from 'msw/node';

/**
 * MSW mock server returning deterministic Coveo Commerce API responses.
 *
 * It is preloaded into the Express server process during end-to-end tests
 * (see `mocks/register.ts` and `playwright.config.ts`) so the server-side
 * `fetchStaticState` calls are intercepted. It never runs during a normal
 * `pnpm dev` / `pnpm start`, where the sample talks to the public
 * `searchuisamples` organization.
 */
const commerceApi = new MockCommerceApi();

export const server = setupServer(...commerceApi.handlers);
