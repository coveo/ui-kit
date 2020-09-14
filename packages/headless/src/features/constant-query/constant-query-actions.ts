import {createAction} from '@reduxjs/toolkit';
/**
 * Sets cq to the value provided if it is currently empty.
 * @param {string} cq The value for the new constant query.
 */
export const registerConstantQuery = createAction<string>(
  'constantQuery/register'
);

/**
 * Sets cq to the value provided.
 * @param {string} cq The value for the new constant query.
 */
export const updateConstantQuery = createAction<string>('constantQuery/update');
