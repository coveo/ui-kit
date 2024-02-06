/**
 * Waits for the next microtasks to be executed.
 * @link https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
 *
 * Enqueue a (macro)task using setTimeout() with a timeout of 0 milliseconds.
 * This will cause the currently enqueued microtasks to be run before the (macro)task.
 * Note: Unresolvable promises, such as those waiting for a network response won't be executed.
 * This should not be a problem in Unit Tests, as the network (should?) is mocked.
 */
export function clearMicrotaskQueue(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
