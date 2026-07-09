import {server} from './node';

/**
 * Starts the MSW mock server inside the Express server process for end-to-end
 * tests.
 *
 * The `build:mocks` script bundles this file to `dist-mocks/register.mjs`
 * (esbuild), and `playwright.config.ts` preloads that bundle into the server
 * process via `NODE_OPTIONS=--import ./dist-mocks/register.mjs`. Pre-bundling
 * ahead of time lets the tests reuse `@coveo/platform-mock-api` (published as
 * TypeScript source) without adding a runtime TypeScript loader to the server.
 */
server.listen({onUnhandledRequest: 'bypass'});
