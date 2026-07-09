import {
  buildParameterSerializer,
  type CommerceSearchParameters,
  type ParameterManager as ParameterManagerController,
} from '@coveo/headless/ssr-commerce';

/**
 * Keeps the URL in sync with the commerce parameters (query, facets, sort,
 * pagination) so state is shareable and survives a refresh, and reflects
 * browser back/forward navigation back into the controller.
 *
 * The server seeds the initial parameters by deserializing the request URL (see
 * `server.ts`); this hydrated counterpart maintains the URL from then on.
 */
export function hydrateParameterManager(
  parameterManager: ParameterManagerController<CommerceSearchParameters>
) {
  const {serialize, deserialize} = buildParameterSerializer();
  let previousUrl = location.href;

  // Controller state changes → URL. `pushState` does not trigger `popstate`,
  // and the `newUrl === previousUrl` guard avoids redundant history entries.
  parameterManager.subscribe(() => {
    const newUrl = serialize(
      parameterManager.state.parameters,
      new URL(location.href)
    );
    if (newUrl === previousUrl) {
      return;
    }
    previousUrl = newUrl;
    history.pushState(null, document.title, newUrl);
  });

  // Browser back/forward → controller state.
  window.addEventListener('popstate', () => {
    const parameters = deserialize(new URLSearchParams(location.search));
    previousUrl = serialize(parameters, new URL(location.href));
    parameterManager.synchronize(parameters);
  });
}
