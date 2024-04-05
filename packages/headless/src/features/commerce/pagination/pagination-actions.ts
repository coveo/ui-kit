import {NumberValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';

const numberValue = new NumberValue({required: true, min: 0});

export const setPageSize = createAction(
  'commerce/pagination/setPageSize',
  (payload: number) => validatePayload(payload, numberValue)
);

export const selectPage = createAction(
  'commerce/pagination/selectPage',
  (payload: number) => validatePayload(payload, numberValue)
);

export const nextPage = createAction('commerce/pagination/nextPage');

export const previousPage = createAction('commerce/pagination/previousPage');
