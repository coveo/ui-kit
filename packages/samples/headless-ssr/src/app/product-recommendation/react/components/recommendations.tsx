'use client';

import {usePopularBought} from '../common/engine';

export function PopularBoughtRecommendations() {
  const {state} = usePopularBought();

  return (
    <ul>
      {state.recommendations.map((recommendation) => (
        <li key={recommendation.permanentid}>{recommendation.ec_name}</li>
      ))}
    </ul>
  );
}
