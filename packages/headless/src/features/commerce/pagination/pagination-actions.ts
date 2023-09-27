import {NumberValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';

const numberValue = new NumberValue({required: true, min: 0});

export const selectPage = createAction(
  'commerce/productListing/pagination/selectPage',
  (payload: number) => validatePayload(payload, numberValue)
);

export const nextPage = createAction(
  'commerce/productListing/pagination/nextPage'
);

export const previousPage = createAction(
  'commerce/productListing/pagination/previousPage'
);
