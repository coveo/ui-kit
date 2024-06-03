import {NumberValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  nonRequiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload';

export const slotIdDefinition = {
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

export type SetPageSizeActionCreatorPayload = SlotIdPayload & {
  /**
   * The number of items to display per page.
   */
  pageSize: number;
};

export const setPageSize = createAction(
  'commerce/pagination/setPageSize',
  (payload: SetPageSizeActionCreatorPayload) =>
    validatePayload(payload, setPageSizeDefinition)
);

const selectPageDefinition = {
  ...slotIdDefinition,
  page: new NumberValue({required: true, min: 0}),
};

export type SelectPageActionCreatorPayload = SlotIdPayload & {
  /**
   * The 1-based page number to select.
   */
  page: number;
};

export const selectPage = createAction(
  'commerce/pagination/selectPage',
  (payload: SelectPageActionCreatorPayload) =>
    validatePayload(payload, selectPageDefinition)
);

export type NextPageActionCreatorPayload = SlotIdPayload;

export const nextPage = createAction(
  'commerce/pagination/nextPage',
  (payload?: NextPageActionCreatorPayload) =>
    validatePayload(payload, slotIdDefinition)
);

export type PreviousPageActionCreatorPayload = SlotIdPayload;

export const previousPage = createAction(
  'commerce/pagination/previousPage',
  (payload?: PreviousPageActionCreatorPayload) =>
    validatePayload(payload, slotIdDefinition)
);

export type RegisterRecommendationsSlotPaginationActionCreatorPayload =
  Required<SlotIdPayload>;

export const registerRecommendationsSlotPagination = createAction(
  'commerce/pagination/registerRecommendationsSlot',
  (payload: RegisterRecommendationsSlotPaginationActionCreatorPayload) =>
    validatePayload(payload, {
      slotId: requiredNonEmptyString,
    })
);
