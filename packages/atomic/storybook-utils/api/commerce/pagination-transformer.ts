interface PaginationRequest {
  page?: number;
  perPage?: number;
}

interface WithPagination {
  pagination: {
    page: number;
    perPage: number;
    totalEntries: number;
    totalPages: number;
  };
}

/**
 * Request transformer for commerce endpoints that reflects pagination parameters
 * (page, perPage) from the request into the response.
 */
export function commercePaginationTransformer<T extends WithPagination>(
  body: unknown,
  response: T
): T {
  const requestBody = body as PaginationRequest;
  const page = requestBody.page ?? response.pagination.page;
  const perPage = requestBody.perPage ?? response.pagination.perPage;
  const totalEntries = response.pagination.totalEntries;
  const totalPages = Math.ceil(totalEntries / Math.max(perPage, 1));

  return {
    ...response,
    pagination: {
      page,
      perPage,
      totalEntries,
      totalPages,
    },
  };
}
