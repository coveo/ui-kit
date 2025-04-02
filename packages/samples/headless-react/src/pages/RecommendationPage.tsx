import {
  buildRecommendationEngine,
  buildRecommendationList,
  getSampleRecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';
import {useMemo} from 'react';
import {RecommendationList} from '../components/recommendation-list/recommendation-list.class';
import {RecommendationList as RecommendationListFn} from '../components/recommendation-list/recommendation-list.fn';
import {AppContext} from '../context/engine';
import {Section} from '../layout/section';

export function RecommendationPage() {
  const engine = useMemo(
    () =>
      buildRecommendationEngine({
        configuration: getSampleRecommendationEngineConfiguration(),
      }),
    []
  );

  const recommendationList = useMemo(
    () => buildRecommendationList(engine),
    [engine]
  );

  return (
    <AppContext.Provider value={{recommendationEngine: engine}}>
      <Section title="recommendation-list">
        <RecommendationList />
        <RecommendationListFn controller={recommendationList} />
      </Section>
    </AppContext.Provider>
  );
}
