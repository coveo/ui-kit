/**
 * Results Feature Selectors
 *
 * Provides library-agnostic selectors for reading results state.
 */

import {getOrCreateResultsSelectors} from '@/src/core/internal/result-list/result-list-selectors.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';

export const getResults = (iface: InterfaceHandle) => {
  return getOrCreateResultsSelectors(iface).getResults;
};

export {
  createResultsSelectors,
  getOrCreateResultsSelectors,
} from '@/src/core/internal/result-list/result-list-selectors.js';
