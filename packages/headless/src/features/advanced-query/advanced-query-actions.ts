import {createAction} from '@reduxjs/toolkit';

/**
 * Sets the aq value.
 * @param aq (string) The new advanced query value (e.g., `@year==2017`).
 */
export const updateAdvancedQuery = createAction<string>('advancedQuery/update');
