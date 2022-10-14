import {
  getSampleRecommendationEngineConfiguration,
  RecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';
import {debounce} from 'lodash';
import {addons} from '@storybook/addons';
import {A11Y_EXTENSION_EVENTS} from '../register';
import CoreEvents from '@storybook/core-events';

interface SearchInterface extends HTMLElement {
  initialize: (cfg: RecommendationEngineConfiguration) => Promise<void>;
  getRecommendations: () => Promise<void>;
}

const orgIdentifier = getSampleRecommendationEngineConfiguration();

export const initializeInterfaceDebounced = (
  renderComponentFunction: () => string,
  engineConfig: Partial<RecommendationEngineConfiguration> = {}
) => {
  return debounce(
    async () => {
      const searchInterface = document.querySelector(
        'atomic-recs-interface'
      ) as HTMLElement;
      const clone = searchInterface.cloneNode() as SearchInterface;
      const childComponent = renderComponentFunction();
      clone.innerHTML = childComponent;
      searchInterface.replaceWith(clone);
      await clone.initialize({
        ...orgIdentifier,
        ...engineConfig,
      });

      await clone.getRecommendations();
      addons.getChannel().emit(A11Y_EXTENSION_EVENTS.SEARCH_EXECUTED);
      addons.getChannel().on(CoreEvents.DOCS_RENDERED, () => {
        clone.innerHTML = '';
      });
    },
    1000,
    {trailing: true}
  );
};
