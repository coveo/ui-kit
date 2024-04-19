export interface PaginationSlice {
  page: number;
  perPage?: number;
  totalCount: number;
  totalPages: number;
}

export type CommercePaginationState = Record<
  string,
  PaginationSlice | undefined
>;

export function getCommercePaginationInitialState(): CommercePaginationState {
  return {};
}

export function getCommercePaginationInitialSlice(): PaginationSlice {
  return {
    page: 0,
    totalCount: 0,
    totalPages: 0,
  };
}
