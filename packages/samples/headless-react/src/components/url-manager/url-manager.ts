import {buildUrlManager, SearchEngine} from '@coveo/headless';

/**
 * Search parameters, defined in the url's hash, should not be restored until all components are registered.
 *
 * Additionally, a search should not be executed until search parameters are restored.
 */
export function bindUrlManager(engine: SearchEngine) {
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
    history.pushState(null, document.title, hash);
  });

  return () => {
    window.removeEventListener('hashchange', onHashChange);
    unsubscribeManager();
  };
}
