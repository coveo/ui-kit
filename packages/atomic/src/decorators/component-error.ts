const loggedErrors = new WeakSet<Error>();

/**
 * Logs a component error to the console with the element it belongs to, once per error instance.
 *
 * @param error The error to log.
 * @param element The element the error belongs to.
 */
export function logComponentError(error: Error, element: Element) {
  if (loggedErrors.has(error)) {
    return;
  }
  loggedErrors.add(error);
  console.error(error, element);
}
