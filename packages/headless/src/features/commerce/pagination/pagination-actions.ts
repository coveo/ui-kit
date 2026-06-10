import * as z from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {
  nonRequiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';

const slotIdDefinition = z.object({
  slotId: nonRequiredEmptyAllowedString,
});

interface SlotIdPayload {
  /**
   * The unique identifier of the target recommendations slot.
   */
  slotId?: string;
}

const setPageSizeDefinition = z.object({
  slotId: nonRequiredEmptyAllowedString,
  pageSize: z.number().check(z.minimum(0)),
});

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

const selectPageDefinition = z.object({
  slotId: nonRequiredEmptyAllowedString,
  page: z.number().check(z.minimum(0)),
});

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
    validatePayload(
      payload,
      z.object({
        slotId: requiredNonEmptyString,
      })
    )
);
