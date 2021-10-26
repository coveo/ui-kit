import {debounce} from 'lodash';
import {
  SearchEngine,
  EngineConfiguration,
  buildSearchEngine,
  SearchEngineConfiguration,
} from '@coveo/headless';
interface SearchInterface extends HTMLElement {
  initialize: (cfg: SearchEngineConfiguration) => Promise<void>;
  executeFirstSearch: () => Promise<void>;
  engine: SearchEngine;
}

const orgIdentifier = {
  accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
  organizationId: 'searchuisamples',
};

export const initializeInterfaceDebounced = (
  renderComponentFunction: () => string,
  engineConfig: Partial<SearchEngineConfiguration> = {}
) => {
  return debounce(
    async () => {
      const searchInterface = document.querySelector(
        'atomic-search-interface'
      ) as HTMLElement;
      const clone = searchInterface.cloneNode() as SearchInterface;
      const childComponent = renderComponentFunction();
      clone.innerHTML = childComponent;
      searchInterface.replaceWith(clone);
      // TODO: Atomic need to expose *every* configuration option available on headless, not a subset.
      // Or need to accept initializing from an already prebuilt engine.
      // In the meantime, we have to initialize the engine twice, and re-assign it.
      await clone.initialize({
        ...orgIdentifier,
        ...engineConfig,
      });

      await clone.executeFirstSearch();
    },
    1000,
    {trailing: true}
  );
};
