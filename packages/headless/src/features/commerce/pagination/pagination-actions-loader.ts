import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {
  RegisterRecommendationsSlotPaginationActionCreatorPayload,
  NextPageActionCreatorPayload,
  PreviousPageActionCreatorPayload,
  SelectPageActionCreatorPayload,
  SetPageSizeActionCreatorPayload,
  previousPage,
  nextPage,
  selectPage,
  setPageSize,
  registerRecommendationsSlotPagination,
} from './pagination-actions';
import {paginationReducer as commercePagination} from './pagination-slice';

export type {
  RegisterRecommendationsSlotPaginationActionCreatorPayload,
  SetPageSizeActionCreatorPayload,
  SelectPageActionCreatorPayload,
  NextPageActionCreatorPayload,
  PreviousPageActionCreatorPayload,
};

/**
 * The pagination action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface PaginationActionCreators {
  /**
   * Registers pagination for a recommendations slot.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerRecommendationsSlotPagination(
    payload: RegisterRecommendationsSlotPaginationActionCreatorPayload
  ): PayloadAction<RegisterRecommendationsSlotPaginationActionCreatorPayload>;

  /**
   * Sets the page size.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setPageSize(
    payload: SetPageSizeActionCreatorPayload
  ): PayloadAction<SetPageSizeActionCreatorPayload>;

  /**
   * Selects a page.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  selectPage(
    payload: SelectPageActionCreatorPayload
  ): PayloadAction<SelectPageActionCreatorPayload>;

  /**
   * Selects the next page.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  nextPage(
    payload?: NextPageActionCreatorPayload
  ): PayloadAction<NextPageActionCreatorPayload | undefined>;

  /**
   * Selects the previous page.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  previousPage(
    payload?: PreviousPageActionCreatorPayload
  ): PayloadAction<PreviousPageActionCreatorPayload | undefined>;
}

/**
 * Loads the commerce pagination reducer and returns the available pagination action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the pagination action creators.
 */
export function loadPaginationActions(
  engine: CommerceEngine
): PaginationActionCreators {
  engine.addReducers({commercePagination});
  return {
    registerRecommendationsSlotPagination,
    setPageSize,
    selectPage,
    nextPage,
    previousPage,
  };
}
