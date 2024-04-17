import {NumberValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  nonRequiredEmptyAllowedString,
  validatePayload,
} from '../../../utils/validate-payload';

export const slotIdDefinition = {
  slotId: nonRequiredEmptyAllowedString,
};

interface SlotIdPayload {
  slotId?: string;
}

const setPageSizeDefinition = {
  ...slotIdDefinition,
  pageSize: new NumberValue({required: true, min: 0}),
};

type SetPageSizePayload = SlotIdPayload & {
  pageSize: number;
};

export const setPageSize = createAction(
  'commerce/pagination/setPageSize',
  (payload: SetPageSizePayload) =>
    validatePayload(payload, setPageSizeDefinition)
);

const selectPageDefinition = {
  ...slotIdDefinition,
  page: new NumberValue({required: true, min: 0}),
};

type SelectPagePayload = SlotIdPayload & {
  page: number;
};

export const selectPage = createAction(
  'commerce/pagination/selectPage',
  (payload: SelectPagePayload) => validatePayload(payload, selectPageDefinition)
);

export const nextPage = createAction(
  'commerce/pagination/nextPage',
  (payload?: SlotIdPayload) => validatePayload(payload, slotIdDefinition)
);

export const previousPage = createAction(
  'commerce/pagination/previousPage',
  (payload?: SlotIdPayload) => validatePayload(payload, slotIdDefinition)
);
