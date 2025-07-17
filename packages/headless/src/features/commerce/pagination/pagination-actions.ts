import {NumberValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  nonRequiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';

const slotIdDefinition = {
  slotId: nonRequiredEmptyAllowedString,
};

interface SlotIdPayload {
  /**
   * The unique identifier of the target recommendations slot.
   */
  slotId?: string;
}

const setPageSizeDefinition = {
  ...slotIdDefinition,
  pageSize: new NumberValue({required: true, min: 0}),
};

export type SetPageSizePayload = SlotIdPayload & {
  /**
   * The number of items to display per page.
   */
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

export type SelectPagePayload = SlotIdPayload & {
  /**
   * The 1-based page number to select.
   */
  page: number;
};

export const selectPage = createAction(
  'commerce/pagination/selectPage',
  (payload: SelectPagePayload) => validatePayload(payload, selectPageDefinition)
);

export type NextPagePayload = SlotIdPayload;

export const nextPage = createAction(
  'commerce/pagination/nextPage',
  (payload?: NextPagePayload) => validatePayload(payload, slotIdDefinition)
);

export type PreviousPagePayload = SlotIdPayload;

export const previousPage = createAction(
  'commerce/pagination/previousPage',
  (payload?: PreviousPagePayload) => validatePayload(payload, slotIdDefinition)
);

export type RegisterRecommendationsSlotPaginationPayload =
  Required<SlotIdPayload>;

export const registerRecommendationsSlotPagination = createAction(
  'commerce/pagination/registerRecommendationsSlot',
  (payload: RegisterRecommendationsSlotPaginationPayload) =>
    validatePayload(payload, {
      slotId: requiredNonEmptyString,
    })
);
