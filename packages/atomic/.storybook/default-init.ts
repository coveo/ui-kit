import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {debounce} from 'lodash';

interface SearchInterface extends HTMLElement {
  initialize: (cfg: {
    accessToken: string;
    organizationId: string;
  }) => Promise<void>;
  executeFirstSearch: () => Promise<void>;
}

export const initializeInterfaceDebounced = (
  renderComponentFunction: () => string
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
      const sampleConfig = getSampleSearchEngineConfiguration();
      await clone.initialize({
        accessToken: sampleConfig.accessToken,
        organizationId: sampleConfig.organizationId,
      });
      clone.executeFirstSearch();
    },
    1000,
    {trailing: true}
  );
};
