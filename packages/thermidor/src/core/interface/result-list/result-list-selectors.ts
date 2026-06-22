/**
 * Results Feature Selectors
 *
 * Provides library-agnostic selectors for reading results state.
 */

import {getOrCreateResultsSelectors} from '@/src/core/internal/result-list/result-list-selectors.js';

export const getResults = (interfaceId: string = 'default') => {
  return getOrCreateResultsSelectors(interfaceId).getResults;
};

export {
  createResultsSelectors,
  getOrCreateResultsSelectors,
} from '@/src/core/internal/result-list/result-list-selectors.js';
