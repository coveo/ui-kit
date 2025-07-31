import {createAction} from '@reduxjs/toolkit';

interface GenericAPIError {
  status: number;
  statusCode: number;
  message: string;
  type: string;
  ignored?: boolean;
}

/**
 * Action creator for setting a generic API error in the application state.
 *
 * This action is used by the renew access token middleware to handle
 * authentication-related errors. It should be added to any Redux slice that may
 * receive a 401 (Unauthorized) or 419 (Authentication Timeout) error from an API call.
 */
export const setError = createAction<GenericAPIError>('app/setError');
