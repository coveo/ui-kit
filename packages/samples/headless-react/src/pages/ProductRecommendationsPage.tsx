import {
  buildProductRecommendationEngine,
  buildFrequentlyViewedTogetherList,
} from '@coveo/headless/product-recommendation';
import {RecommendationList} from '../components/product-recommendations/popular-viewed.class';
import {RecommendationList as RecommendationListFn} from '../components/product-recommendations/popular-viewed.fn';
import {AppContext} from '../context/engine';
import {Section} from '../layout/section';

export function ProductRecommendationsPage() {
  const engine = buildProductRecommendationEngine({
    configuration: {
      accessToken: 'xxc23ce82a-3733-496e-b37e-9736168c4fd9',
      organizationId: 'electronicscoveodemocomo0n2fu8v',
      platformUrl: 'https://platform.cloud.coveo.com',
    },
  });

  const recommendationList = buildFrequentlyViewedTogetherList(engine, {
    options: {
      maxNumberOfRecommendations: 5,
    },
  });

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
