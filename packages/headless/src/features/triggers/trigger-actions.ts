import {createAction} from '@reduxjs/toolkit';

/**
 * Clears the trigger query parameter to an empty string.
 */
export const clearQueryTrigger = createAction('triggers/queryClear');

/**
 * Clears the trigger notify parameter to an empty string.
 */
export const clearNotifyTrigger = createAction('triggers/notifyClear');
