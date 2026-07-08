import type {Supports} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {getOrCreateSearchParametersActions} from '@/src/internal/features/search-parameters/index.js';
import {getOrCreateSearchParametersSlice} from '@/src/internal/features/search-parameters/index.js';

export interface LoadSearchParametersActionsOptions {
  interface: Supports<'search'>;
}

/**
 * Loads the search parameters actions for the given interface.
 * @param options - The options containing the interface handle.
 * @returns The search parameters actions: `setPipeline` and `setConstantQuery`.
 */
export function loadSearchParametersActions(
  options: LoadSearchParametersActionsOptions
) {
  const {engine} = getHandleInternals(options.interface);

  engine.adoptSlice(getOrCreateSearchParametersSlice(options.interface));

  const actions = getOrCreateSearchParametersActions(options.interface);

  return {
    setPipeline(pipeline: string) {
      engine.mutate(actions.setPipeline(pipeline));
    },
    setConstantQuery(cq: string) {
      engine.mutate(actions.setConstantQuery(cq));
    },
  };
}
