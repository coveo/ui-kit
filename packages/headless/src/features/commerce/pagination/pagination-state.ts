export interface CommercePaginationState {
  page: number;
  perPage?: number;
  totalItems: number;
  totalPages: number;
}

export function getCommercePaginationInitialState(): CommercePaginationState {
  return {
    page: 0,
    totalItems: 0,
    totalPages: 0,
  };
}
