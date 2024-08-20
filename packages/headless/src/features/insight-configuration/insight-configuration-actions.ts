import {StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload';

const optionalNonEmptyString = new StringValue({
  required: false,
  emptyAllowed: false,
});

export const searchConfigurationPayloadDefinition = {
  locale: optionalNonEmptyString,
};

export interface SetInsightConfigurationActionCreatorPayload {
  /**
   * The unique identifier of the target insight configuration.
   */
  insightId: string;
}

export const setInsightConfiguration = createAction(
  'insightConfiguration/set',
  (payload: SetInsightConfigurationActionCreatorPayload) =>
    validatePayload(payload, {
      insightId: requiredNonEmptyString,
    })
);
