import {
  buildRecommendationEngine,
  buildRecommendationList,
  getSampleRecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';
import {RecommendationList} from '../components/recommendation-list/recommendation-list.class';
import {RecommendationList as RecommendationListFn} from '../components/recommendation-list/recommendation-list.fn';
import {AppContext} from '../context/engine';
import {Section} from '../layout/section';

export function RecommendationPage() {
  const engine = buildRecommendationEngine({
    configuration: getSampleRecommendationEngineConfiguration(),
  });

  const recommendationList = buildRecommendationList(engine);

  return (
    <AppContext.Provider value={{recommendationEngine: engine}}>
      <Section title="recommendation-list">
        <RecommendationList />
        <RecommendationListFn controller={recommendationList} />
      </Section>
    </AppContext.Provider>
  );
}
