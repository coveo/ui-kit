import * as z from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload.js';

const numberValue = z.number().check(z.minimum(0));

export const registerNumberOfResults = createAction(
  'pagination/registerNumberOfResults',
  (payload: number) => validatePayload(payload, numberValue)
);

export const updateNumberOfResults = createAction(
  'pagination/updateNumberOfResults',
  (payload: number) => validatePayload(payload, numberValue)
);

export const registerPage = createAction(
  'pagination/registerPage',
  (payload: number) => validatePayload(payload, numberValue)
);

export const updatePage = createAction(
  'pagination/updatePage',
  (payload: number) => validatePayload(payload, numberValue)
);

export const nextPage = createAction('pagination/nextPage');

export const previousPage = createAction('pagination/previousPage');
