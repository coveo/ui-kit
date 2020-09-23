import {createAction} from '@reduxjs/toolkit';
/**
 * Sets the cq value if it is currently empty.
 * @param cq (string) The new constant query value (e.g., `@source=="Products"`).
 */
export const registerConstantQuery = createAction<string>(
  'constantQuery/register'
);

/**
 * Sets the cq value.
 * @param cq (string) The new constant query value (e.g., `@source=="Products"`).
 */
export const updateConstantQuery = createAction<string>('constantQuery/update');
