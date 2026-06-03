import type {SearchBoxSuggestionElement} from './suggestions-types';

/**
 * Checks if a search box suggestion element has no query.
 *
 * @param el - The search box suggestion element to check
 * @returns True if the element has no query or the query is whitespace-only
 */
export function elementHasNoQuery(el: SearchBoxSuggestionElement): boolean {
  return !el.query || el.query.trim() === '';
}

/**
 * Checks if a search box suggestion element has a query.
 *
 * @param el - The search box suggestion element to check
 * @returns True if the element has a non-empty, non-whitespace query
 */
export function elementHasQuery(el: SearchBoxSuggestionElement): boolean {
  return !!el.query && el.query.trim() !== '';
}
