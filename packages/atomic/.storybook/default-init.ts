import {
  getSampleSearchEngineConfiguration,
  SearchEngineConfiguration,
} from '@coveo/headless';
import {debounce} from 'lodash';
import {addons} from '@storybook/addons';
import {A11Y_EXTENSION_EVENTS} from './register';
import CoreEvents from '@storybook/core-events';

interface SearchInterface extends HTMLElement {
  initialize: (cfg: SearchEngineConfiguration) => Promise<void>;
  executeFirstSearch: () => Promise<void>;
}

const orgIdentifier = getSampleSearchEngineConfiguration();

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
      addons.getChannel().emit(A11Y_EXTENSION_EVENTS.SEARCH_EXECUTED);
      addons.getChannel().on(CoreEvents.DOCS_RENDERED, () => {
        clone.innerHTML = '';
      });
    },
    1000,
    {trailing: true}
  );
};
