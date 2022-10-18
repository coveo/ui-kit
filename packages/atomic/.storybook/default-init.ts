import {
  getSampleSearchEngineConfiguration,
  SearchEngineConfiguration,
} from '@coveo/headless';
import {debounce} from 'lodash';
import {dispatchAddons} from './dispatch-addons';

interface SearchInterface extends HTMLElement {
  initialize: (cfg: SearchEngineConfiguration) => Promise<void>;
  executeFirstSearch: () => Promise<void>;
}

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
      clone.innerHTML = renderComponentFunction();
      searchInterface.replaceWith(clone);
      await clone.initialize({
        ...getSampleSearchEngineConfiguration(),
        ...engineConfig,
      });

      await clone.executeFirstSearch();
      dispatchAddons(clone);
    },
    1000,
    {trailing: true}
  );
};
