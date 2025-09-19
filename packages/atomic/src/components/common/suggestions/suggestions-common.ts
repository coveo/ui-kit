/**
 * @fileoverview Re-exports all suggestion-related functionality for backward compatibility.
 *
 * This module serves as the main entry point for suggestion functionality while
 * maintaining backward compatibility. The actual implementations have been moved
 * to more focused modules:
 *
 * - `suggestions-types.ts` - Core interfaces and types
 * - `suggestions-utils.ts` - Utility functions for suggestion elements
 * - `suggestions-events.ts` - Event dispatching logic
 */

export {dispatchSearchBoxSuggestionsEvent} from './suggestions-events';

export type {
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
} from './suggestions-types';

export {
  elementHasNoQuery,
  elementHasQuery,
} from './suggestions-utils';
