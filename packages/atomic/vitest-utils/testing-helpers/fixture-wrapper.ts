// This file is adapted from https://github.com/open-wc/open-wc
const cachedWrappers: Set<HTMLElement> = new Set();

/**
 * Wrapper for fixture, creates a new parent node and appends it to the document body
 * You do not need to use this function directly in the tests if you use `fixture`.
 * @param {HTMLElement} parentNode - The parent node to append to the document body.
 */
export function fixtureWrapper(parentNode: HTMLElement) {
  document.body.appendChild(parentNode);
  cachedWrappers.add(parentNode);
  return parentNode;
}

/**
 * Cleans up all the cached wrappers created by the fixtureWrapper function.
 * This function will automatically be called after each tests.
 */
export function fixtureCleanup() {
  if (cachedWrappers.size > 0) {
    for (const wrapper of cachedWrappers) {
      document.body.removeChild(wrapper);
    }
    cachedWrappers.clear();
  }
}
