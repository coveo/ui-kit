import type {Supports} from '@/src/core/interface/utils/interface-types.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import {getOrCreateSearchParametersActions} from '@/src/core/internal/search-parameters/search-parameters-actions.js';
import {getOrCreateSearchParametersSlice} from '@/src/core/internal/search-parameters/search-parameters-slice.js';

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
  const {engine, stateId} = getHandleInternals(options.interface);

  engine.adoptSlice(getOrCreateSearchParametersSlice(stateId));

  const actions = getOrCreateSearchParametersActions(stateId);

  return {
    setPipeline(pipeline: string) {
      engine.mutate(actions.setPipeline(pipeline));
    },
    setConstantQuery(cq: string) {
      engine.mutate(actions.setConstantQuery(cq));
    },
  };
}
