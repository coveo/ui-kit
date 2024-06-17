import {
  buildCommerceEngine,
  buildRecommendations,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {useMemo} from 'react';
import {Recommendations} from '../../components/commerce/recommendations.fn';
import {AppContext} from '../../context/engine';
import {Section} from '../../layout/section';

export function RecommendationsPage() {
  const engine = useMemo(
    () =>
      buildCommerceEngine({
        configuration: getSampleCommerceEngineConfiguration(),
      }),
    []
  );

  const recommendations = buildRecommendations(engine, {
    options: {
      slotId: 'abccdea4-7d8d-4d56-b593-20267083f88f',
    },
  });

  return (
    <AppContext.Provider value={{commerceEngine: engine}}>
      <Section title="recommendations">
        <Recommendations controller={recommendations} />
      </Section>
    </AppContext.Provider>
  );
}
