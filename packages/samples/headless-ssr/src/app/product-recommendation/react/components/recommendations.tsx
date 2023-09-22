'use client';

import {usePopularViewed} from '../common/engine';

export function PopularViewedRecommendations() {
  const {state} = usePopularViewed();

  return (
    <ul>
      {state.recommendations.map((recommendation) => (
        <li key={recommendation.permanentid}>{recommendation.ec_name}</li>
      ))}
    </ul>
  );
}
