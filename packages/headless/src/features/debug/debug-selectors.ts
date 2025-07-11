import type {SearchSection} from '../../state/state-sections.js';
import {parseRankingInfo} from './ranking-info-parser.js';

export function rankingInformationSelector(state: SearchSection) {
  const results = state.search.response.results;
  return results.map((result) => {
    const ranking = parseRankingInfo(result.rankingInfo!);
    return {
      result,
      ranking,
    };
  });
}
