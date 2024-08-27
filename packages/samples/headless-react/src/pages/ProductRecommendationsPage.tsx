import {getOrganizationEndpoints} from '@coveo/headless';
import {
  buildProductRecommendationEngine,
  buildFrequentlyViewedTogetherList,
} from '@coveo/headless/product-recommendation';
import {useMemo} from 'react';
import {RecommendationList} from '../components/product-recommendations/popular-viewed.class';
import {RecommendationList as RecommendationListFn} from '../components/product-recommendations/popular-viewed.fn';
import {AppContext} from '../context/engine';
import {Section} from '../layout/section';

export function ProductRecommendationsPage() {
  const organizationId = 'electronicscoveodemocomo0n2fu8v';
  const engine = useMemo(
    () =>
      buildProductRecommendationEngine({
        configuration: {
          accessToken: 'xxc23ce82a-3733-496e-b37e-9736168c4fd9',
          organizationId,
          organizationEndpoints: getOrganizationEndpoints(organizationId),
          searchHub: 'UI_KIT_E2E',
        },
      }),
    []
  );

  const recommendationList = useMemo(
    () =>
      buildFrequentlyViewedTogetherList(engine, {
        options: {
          maxNumberOfRecommendations: 5,
        },
      }),
    [engine]
  );

  return (
    <AppContext.Provider value={{productRecommendationEngine: engine}}>
      <Section title="product-recommendations-list">
        <h3>As class:</h3>
        <RecommendationList />
        <h3>As function:</h3>
        <RecommendationListFn controller={recommendationList} />
      </Section>
    </AppContext.Provider>
  );
}
