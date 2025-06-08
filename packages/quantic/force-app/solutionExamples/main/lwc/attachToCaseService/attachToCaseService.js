/**
 * Stub method to simulate attaching a result to a case.
 *
 * This function should be replaced with a real Apex implementation in the customer project.
 * It returns a mock success response.
 *
 * @param {{[key: string]: any}} resultToAttach - The result object to attach, typically includes case ID and result metadata.
 * @returns {Promise<string>} A promise that resolves to a JSON stringified response, e.g., `{"succeeded": true}`.
 */
// eslint-disable-next-line no-unused-vars
export function attachToCase(resultToAttach) {
  console.warn(
    'attachToCase was called, but no real implementation was provided.'
  );
  return Promise.resolve(JSON.stringify({succeeded: true}));
}

/**
 * Stub method to simulate detaching a result from a case.
 *
 * This function should be replaced with a real Apex implementation in the customer project.
 * It returns a mock success response.
 *
 * @param {{[key: string]: any}} resultToDetach - The result object to detach, typically includes case ID and result metadata.
 * @returns {Promise<string>} A promise that resolves to a JSON stringified response, e.g., `{"succeeded": true}`.
 */
// eslint-disable-next-line no-unused-vars
export function detachFromCase(resultToDetach) {
  console.warn(
    'detachFromCase was called, but no real implementation was provided.'
  );
  return Promise.resolve(JSON.stringify({succeeded: true}));
}

/**
 * Stub method to simulate retrieving all attached results.
 *
 * This function should be replaced with a real Apex implementation in the customer project.
 * It returns an empty list by default.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of attached results.
 */
export function getAllAttachedResults() {
  console.warn(
    'getAllAttachedResults was called, but no real implementation was provided.'
  );
  return Promise.resolve([]);
}
