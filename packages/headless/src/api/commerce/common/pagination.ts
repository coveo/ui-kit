export interface Pagination {
  page: number;
  perPage: number;
  totalEntries: number;
  totalPages: number;
}

export interface PaginationWithResultTypeCounts extends Pagination {
  // TODO: should these be optional or required?
  totalProducts?: number;
  totalSpotlights?: number;
}
