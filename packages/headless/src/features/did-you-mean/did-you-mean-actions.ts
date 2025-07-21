import {StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import type {CorrectionMode} from './did-you-mean-state.js';

export const enableDidYouMean = createAction('didYouMean/enable');

export const disableDidYouMean = createAction('didYouMean/disable');

export const disableAutomaticQueryCorrection = createAction(
  'didYouMean/automaticCorrections/disable'
);

export const enableAutomaticQueryCorrection = createAction(
  'didYouMean/automaticCorrections/enable'
);

export const applyDidYouMeanCorrection = createAction(
  'didYouMean/correction',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);

export const setCorrectionMode = createAction(
  'didYouMean/automaticCorrections/mode',
  (payload: CorrectionMode) =>
    validatePayload(
      payload,
      new StringValue<CorrectionMode>({
        constrainTo: ['next', 'legacy'],
        emptyAllowed: false,
        required: true,
      })
    )
);
