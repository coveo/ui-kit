import {QueryCorrection} from '../../api/search/search/query-corrections';

export interface DidYouMeanState {
  enableDidYouMean: boolean;
  wasCorrectedTo: string;
  wasAutomaticallyCorrected: boolean;
  queryCorrection: QueryCorrection;
}

export const emptyCorrection = () => ({
  correctedQuery: '',
  wordCorrections: [],
});

export function getDidYouMeanInitialState(): DidYouMeanState {
  return {
    enableDidYouMean: false,
    wasCorrectedTo: '',
    wasAutomaticallyCorrected: false,
    queryCorrection: emptyCorrection(),
  };
}
