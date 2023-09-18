import { createAction } from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {CommerceContextState} from './context-state';

export interface SetContextPayload extends CommerceContextState {
}
export const setContext = createAction(
  'commerce/setContext',
  (payload: SetContextPayload) =>
    validatePayload(payload, {}) // TODO: Validate payload
);
