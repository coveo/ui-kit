import {
  getSlicedBySolutionTypeInitialState,
  SlicedBySolutionType,
} from '../common/state';

export interface PaginationSlice {
  page: number;
  perPage?: number;
  totalCount: number;
  totalPages: number;
}

export type CommercePaginationState = SlicedBySolutionType<PaginationSlice>;

export const getCommercePaginationInitialState =
  getSlicedBySolutionTypeInitialState<PaginationSlice>;

export function getCommercePaginationInitialSlice(): PaginationSlice {
  return {
    page: 0,
    totalCount: 0,
    totalPages: 0,
  };
}
