export interface PaginationSlice {
  page: number;
  perPage?: number;
  totalItems: number;
  totalPages: number;
}

export interface CommercePaginationState {
  principal: PaginationSlice;
  recommendations: Record<string, PaginationSlice | undefined>;
}

export function getCommercePaginationInitialState(): CommercePaginationState {
  return {
    principal: getCommercePaginationInitialSlice(),
    recommendations: {},
  };
}

export function getCommercePaginationInitialSlice(): PaginationSlice {
  return {
    page: 0,
    totalItems: 0,
    totalPages: 0,
  };
}
