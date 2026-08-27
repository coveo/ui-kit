/**
 * Used internally in https://github.com/coveo/ui-kit for testing purposes, not
 * needed in your own implementation.
 *
 * Name of the global the root layout publishes so the browser can discover the
 * mock API server at runtime. Next.js only exposes `NEXT_PUBLIC_*` variables to
 * the client by baking them into the bundle at build time, which would force the
 * e2e suite to build the app itself; a server-rendered global avoids that.
 */
export const MOCK_API_URL_GLOBAL = '__coveoMockApiUrl';

declare global {
  interface Window {
    [MOCK_API_URL_GLOBAL]?: string;
  }
}
