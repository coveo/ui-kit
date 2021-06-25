import {createAction} from '@reduxjs/toolkit';

/**
 * Clears the triggers query parameter to an empty string.
 */
export const clearQueryTrigger = createAction('triggers/queryClear');
