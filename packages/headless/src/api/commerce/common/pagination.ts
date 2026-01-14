export interface Pagination {
  page: number;
  perPage: number;
  totalEntries: number;
  totalPages: number;
}

export interface PaginationWithResultTypeCounts extends Pagination {
  totalProducts?: number;
  totalSpotlights?: number;
}
