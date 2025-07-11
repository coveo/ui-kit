import type {Draft} from '@reduxjs/toolkit';
import type {
  Correction,
  QueryCorrection,
} from '../../api/search/search/query-corrections.js';
import {emptyNextCorrection} from './did-you-mean-state.js';

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
