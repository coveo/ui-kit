export interface PaginationState {
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
}

export function getPaginationInitialState(): PaginationState {
  return {
    page: 0,
    perPage: 0,
    totalCount: 0,
    totalPages: 0,
  };
}
