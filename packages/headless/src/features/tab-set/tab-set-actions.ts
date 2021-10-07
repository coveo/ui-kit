import {BooleanValue, RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredEmptyAllowedString,
  validatePayload,
} from '../../utils/validate-payload';

export interface RegisterTabActionCreatorPayload {
  /**
   * A unique identifier for the tab
   */
  id: string;

  /**
   * The tab filter expression.
   */
  expression: string;

  /**
   * When `true`, the tab expression will affect search results.
   */
  isActive: boolean;
}

export const registerTab = createAction(
  'tab/register',
  (payload: RegisterTabActionCreatorPayload) => {
    const schema = new RecordValue({
      values: {
        id: requiredEmptyAllowedString,
        expression: requiredEmptyAllowedString,
        isActive: new BooleanValue({required: true}),
      },
    });

    return validatePayload<RegisterTabActionCreatorPayload>(payload, schema);
  }
);

export const updateActiveTab = createAction(
  'tab/updateActiveTab',
  (id: string) => {
    return validatePayload(id, requiredEmptyAllowedString);
  }
);
