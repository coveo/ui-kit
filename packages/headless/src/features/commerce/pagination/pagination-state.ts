export interface CommercePaginationState {
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
}

export function getCommercePaginationInitialState(): CommercePaginationState {
  return {
    page: 0,
    perPage: 0,
    totalCount: 0,
    totalPages: 0,
  };
}
