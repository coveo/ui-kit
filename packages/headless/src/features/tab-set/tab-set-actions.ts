import * as z from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';

export interface RegisterTabActionCreatorPayload {
  /**
   * A unique identifier for the tab (for example, `"abc"`).
   */
  id: string;

  /**
   * The tab filter expression.
   */
  expression: string;
}

export const registerTab = createAction(
  'tab/register',
  (payload: RegisterTabActionCreatorPayload) => {
    const schema = z.object({
      id: requiredNonEmptyString,
      expression: requiredEmptyAllowedString,
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
