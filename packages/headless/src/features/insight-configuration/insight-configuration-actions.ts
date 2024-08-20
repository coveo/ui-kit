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
  timezone: optionalNonEmptyString,
};

export interface UpdateInsightSearchConfigurationActionCreatorPayload {
  /**
   * The locale of the current user. Must comply with IETF’s BCP 47 definition: https://www.rfc-editor.org/rfc/bcp/bcp47.txt.
   */
  locale?: string;

  /**
   * The [tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) identifier of the time zone of the user.
   */
  timezone?: string;
}

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

export const updateInsightSearchConfiguration = createAction(
  'insightConfiguration/updateInsightSearchConfiguration',
  (payload: UpdateInsightSearchConfigurationActionCreatorPayload) =>
    validatePayload(payload, searchConfigurationPayloadDefinition)
);
