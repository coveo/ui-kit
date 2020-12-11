import {SearchSection} from '../../state/state-sections';
import {parseRankingInfo} from './ranking-info-parser';

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
