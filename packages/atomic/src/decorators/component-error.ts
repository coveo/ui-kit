const loggedErrors = new WeakSet<object>();

/**
 * Logs a component error to the console with the element it belongs to, once per error instance.
 * A value that isn't an object, such as a thrown string, can't be tracked and is logged every time.
 *
 * @param error The error to log.
 * @param element The element the error belongs to.
 */
export function logComponentError(error: unknown, element: Element) {
  if (typeof error === 'object' && error !== null) {
    if (loggedErrors.has(error)) {
      return;
    }
    loggedErrors.add(error);
  }
  console.error(error, element);
}
