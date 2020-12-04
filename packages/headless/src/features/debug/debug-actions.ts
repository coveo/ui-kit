import {createAction} from '@reduxjs/toolkit';

/**
 * Enables debug information on requests.
 */
export const enableDebug = createAction('debug/enable');

/**
 * Disables debug information on requests.
 */
export const disableDebug = createAction('debug/disable');
