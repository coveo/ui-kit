import {Draft} from '@reduxjs/toolkit';
import {
  Correction,
  QueryCorrection,
} from '../../api/search/search/query-corrections';
import {emptyNextCorrection} from './did-you-mean-state';

export const setToNonEmptyQueryCorrection = (
  state: {queryCorrection: Draft<QueryCorrection>; wasCorrectedTo: string},
  correction: Correction | undefined
) => {
  const nonOptionalQueryCorrection = {
    ...emptyNextCorrection(),
    ...correction,
    correctedQuery:
      correction?.correctedQuery ||
      correction?.corrections[0]?.correctedQuery ||
      '',
  };

  state.queryCorrection = nonOptionalQueryCorrection;
  state.wasCorrectedTo = nonOptionalQueryCorrection.correctedQuery;
};
