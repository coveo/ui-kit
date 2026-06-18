import type {Requires} from '@/src/core/interface/utils/interface-types.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateSearchParametersActions} from '@/src/core/internal/search-parameters/search-parameters-actions.js';
import {getOrCreateSearchParametersSlice} from '@/src/core/internal/search-parameters/search-parameters-slice.js';

export interface LoadSearchParametersActionsOptions {
  interface: Requires<'search'>;
}

/**
 * Loads the search parameters actions for the given interface.
 * @param options - The options containing the interface handle.
 * @returns The search parameters actions: `setPipeline` and `setConstantQuery`.
 */
export function loadSearchParametersActions(
  options: LoadSearchParametersActionsOptions
) {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];

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
