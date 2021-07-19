import {createAction} from '@reduxjs/toolkit';
import {RecordValue} from '../../../../bueno/dist';
import {
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayloadAndThrow,
} from '../../utils/validate-payload';
import {isSearchApiDate} from '../../api/date-format';
import {buildRelativeDateDefinition, RelativeDate} from './relative-date';

export interface RegisterRelativeDateActionCreatorPayload {
  /**
   * The unique identifier of the set.
   */
  id: string;
  /**
   * The relative value for the date.
   */
  relativeDate: RelativeDate;
  /**
   * The absolute value for the date, formatted as `YYYY/MM/DD@HH:mm:ss`.
   */
  absoluteDate: string;
}

const relativeRangeRegistrationDefinition = (
  payload: RegisterRelativeDateActionCreatorPayload
) => ({
  id: requiredNonEmptyString,
  relativeDate: new RecordValue({
    options: {required: true},
    values: buildRelativeDateDefinition(payload.relativeDate.period),
  }),
  absoluteDate: requiredNonEmptyString,
});

/**
 * Registers a relative date associated with an absolute Date.
 * @param (RegisterRelativeDateActionCreatorPayload) The options to register the relative date with.
 */
export const registerRelativeDate = createAction(
  'relativeDate/register',
  (payload: RegisterRelativeDateActionCreatorPayload) => {
    try {
      validatePayloadAndThrow(
        payload,
        relativeRangeRegistrationDefinition(payload)
      );
      if (!isSearchApiDate(payload.absoluteDate)) {
        throw new Error(
          'The format of the absoluteDate should follow the format YYYY/MM/DD@HH:mm:ss.'
        );
      }
      return {payload, error: null};
    } catch (error) {
      return {payload, error: serializeSchemaValidationError(error)};
    }
  }
);
