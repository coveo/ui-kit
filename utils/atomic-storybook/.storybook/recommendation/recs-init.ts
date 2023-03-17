import {
  getSampleRecommendationEngineConfiguration,
  RecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';
import {debounce} from 'lodash';
import {dispatchAddons} from '../dispatch-addons';

interface RecsInterface extends HTMLElement {
  initialize: (cfg: RecommendationEngineConfiguration) => Promise<void>;
  getRecommendations: () => Promise<void>;
}

export const initializeInterfaceDebounced = (
  renderComponentFunction: () => string,
  engineConfig: Partial<RecommendationEngineConfiguration> = {}
) => {
  return debounce(
    async () => {
      const recsInterface = document.querySelector(
        'atomic-recs-interface'
      ) as HTMLElement;
      const clone = recsInterface.cloneNode() as RecsInterface;
      clone.innerHTML = renderComponentFunction();
      recsInterface.replaceWith(clone);
      await clone.initialize({
        ...getSampleRecommendationEngineConfiguration(),
        ...engineConfig,
      });

      await clone.getRecommendations();
      dispatchAddons(clone);
    },
    1000,
    {trailing: true}
  );
};
