/**
 * Base response for analytics/UA endpoints.
 * Analytics endpoints typically return a simple success response.
 */
export const baseResponse = {
  success: true,
  visitId: 'mock-visit-id-123',
};

/**
 * Alternative response for analytics endpoints that return detailed information.
 */
export const detailedResponse = {
  ...baseResponse,
  visitorId: 'mock-visitor-id-456',
  timestamp: Date.now(),
};
