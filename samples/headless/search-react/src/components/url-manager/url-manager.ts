import {
  buildSearchStatus,
  buildUrlManager,
  type SearchEngine,
} from '@coveo/headless';

/**
 * Search parameters, defined in the url's hash, should not be restored until all components are registered.
 *
 * Additionally, a search should not be executed until search parameters are restored.
 *
 * @param engine - A headless search engine instance.
 * @returns An unsubscribe function to remove attached event listeners.
 */
export function bindUrlManager(engine: SearchEngine) {
  const statusControllers = buildSearchStatus(engine);
  const fragment = () => window.location.hash.slice(1);

  const urlManager = buildUrlManager(engine, {
    initialState: {fragment: fragment()},
  });
  const onHashChange = () => {
    urlManager.synchronize(fragment());
  };

  window.addEventListener('hashchange', onHashChange);
  const unsubscribeManager = urlManager.subscribe(() => {
    const hash = `#${urlManager.state.fragment}`;

    if (!statusControllers.state.firstSearchExecuted) {
      // The purpose of using `replaceState()` instead of `pushState()` in this case is to ensure that the URL reflects the current state of the search page on the first interface load.

      // If `pushState()` were used instead, users could possibly enter in a history loop, having to click the back button multiple times without being able to return to a previous page.
      // This situation happens with components such as the Tab component, which adds a new state to the browser history stack.

      // `replaceState` instead replaces the current state of the browser history with a new state, effectively updating the URL without adding a new entry to the history stack.
      // See https://docs.coveo.com/en/headless/latest/usage/synchronize-search-parameters-with-the-url/
      history.replaceState(null, document.title, hash);
      return;
    }

    history.pushState(null, document.title, hash);
  });

  return () => {
    window.removeEventListener('hashchange', onHashChange);
    unsubscribeManager();
  };
}
