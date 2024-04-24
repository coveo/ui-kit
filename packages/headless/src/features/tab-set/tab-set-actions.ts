import {BooleanValue, RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload';

export interface RegisterTabActionCreatorPayload {
  /**
   * A unique identifier for the tab (e.g., `"abc"`).
   */
  id: string;

  /**
   * The tab filter expression.
   */
  expression: string;
  /**
   * Whether to clear the state when the active tab changes.
   */
  clearFiltersOnTabChange: boolean;
}

export const registerTab = createAction(
  'tab/register',
  (payload: RegisterTabActionCreatorPayload) => {
    const schema = new RecordValue({
      values: {
        id: requiredNonEmptyString,
        expression: requiredEmptyAllowedString,
        clearFiltersOnTabChange: new BooleanValue(),
      },
    });

    return validatePayload<RegisterTabActionCreatorPayload>(payload, schema);
  }
);

export const updateActiveTab = createAction(
  'tab/updateActiveTab',
  (id: string) => {
    return validatePayload(id, requiredNonEmptyString);
  }
);
