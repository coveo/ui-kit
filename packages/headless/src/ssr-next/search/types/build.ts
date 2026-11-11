import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import type {LegacySearchAction} from '../../../features/analytics/analytics-utils.js';
import type {ContextPayload} from '../../../features/context/context-state.js';
import type {SearchParameterManagerInitialState} from '../controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';

/**
 * The SSR search engine.
 *
 * @group Engine
 */
export interface SSRSearchEngine extends SearchEngine {
  /**
   * Waits for the search to be completed and returns a promise that resolves to a `SearchCompletedAction`.
   */
  waitForSearchCompletedAction(): Promise<SearchCompletedAction>;
}

export type SearchCompletedAction = ReturnType<LegacySearchAction['fulfilled' | 'rejected']>;

/**
 * What a controller definition receives to build its controller for a request: the page facts passed
 * to `fetchStaticState()`.
 */
export interface ControllerBuildContext {
  buildConfig: BuildConfig;
}

export type BuildConfig = {
  navigatorContext: NavigatorContext;
  searchParams?: SearchParameterManagerInitialState['parameters'];
  /**
   * The custom context values of the request, such as the visitor's segment, fed to the `context`
   * controller that every search engine definition includes.
   */
  context?: ContextPayload;
  /**
   * A per-request access token (for example, a per-user Coveo search token) to use for this
   * `fetchStaticState()` or `hydrateStaticState()` call only.
   *
   * When provided, it overrides the access token from the engine definition configuration for this
   * request without mutating the shared definition, which is the supported way to use per-user
   * search tokens in a multi-tenant server process. When omitted, the definition's configured
   * access token is used.
   *
   * `fetchStaticState()` returns this build configuration alongside the static state, so passing the
   * returned static state to `hydrateStaticState()` carries the token to the hydrated engine
   * automatically. That also means the token is serialized into the payload sent to the browser.
   * Use a scoped, short-lived search token rather than an API key, and do not cache a response whose
   * static state carries a per-user token, or one user's token would be served to another.
   *
   * To rotate the token of a hydrated engine that is already running, configure `renewAccessToken`
   * on the engine configuration rather than mutating the shared definition.
   */
  accessToken?: string;
};
