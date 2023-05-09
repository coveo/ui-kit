import {
  buildUrlManager,
  SearchEngine,
  buildSearchStatus,
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
