import {server} from './node';

/**
 * Starts the MSW mock server inside the Next.js server process for end-to-end
 * tests.
 *
 * It is preloaded via `node --import tsx --import ./mocks/register.ts` (see the
 * `webServer` config in `playwright.config.ts`). Loading it this way — outside
 * the Next.js bundle — lets the tests reuse `@coveo/platform-mock-api`
 * (published as TypeScript source) without adding it to the application build.
 */
server.listen({onUnhandledRequest: 'bypass'});
