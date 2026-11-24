import type {EnableResultsOption, ResolvedEnableResults} from '../types/build.js';

/**
 * Resolves the `enableResults` option of an engine definition into one flag per kind of request.
 */
export function resolveEnableResults(
  option: EnableResultsOption | undefined
): ResolvedEnableResults {
  if (typeof option === 'boolean') {
    return {listing: option, search: option};
  }
  return {listing: option?.listing ?? false, search: option?.search ?? false};
}
