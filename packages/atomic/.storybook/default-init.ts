import {
  getSampleSearchEngineConfiguration,
  SearchEngine,
  SearchEngineConfiguration,
} from '@coveo/headless';
import {debounce} from 'lodash';
interface SearchInterface extends HTMLElement {
  initialize: (cfg: SearchEngineConfiguration) => Promise<void>;
  executeFirstSearch: () => Promise<void>;
  engine: SearchEngine;
}

const orgIdentifier = {
  accessToken: getSampleSearchEngineConfiguration().accessToken,
  organizationId: getSampleSearchEngineConfiguration().organizationId,
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
