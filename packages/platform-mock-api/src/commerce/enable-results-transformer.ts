interface EnableResultsRequest {
  enableResults?: boolean;
}

interface WithProductsAndResults {
  products: unknown[];
  results: unknown[];
}

/**
 * Request transformer for commerce endpoints that reproduces the `enableResults`
 * behavior of the Commerce API: when a request opts in, items are returned under
 * `results` — which may also hold spotlight content — and `products` is left empty.
 *
 * Without this transformer, a mock always answers with `products`, which hides
 * bugs in consumers that read `products` while opting into `results`.
 */
export function commerceEnableResultsTransformer<T extends WithProductsAndResults>(
  body: unknown,
  response: T
): T {
  if (!(body as EnableResultsRequest | null)?.enableResults) {
    return response;
  }

  return {
    ...response,
    products: [],
    results: response.results.length > 0 ? response.results : response.products,
  };
}
