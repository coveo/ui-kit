import type {Supports} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {
  getOrCreateSortActions,
  getOrCreateSortSelectors,
  getOrCreateSortSlice,
} from '@/src/internal/features/sort/index.js';
import type {CommerceSearchSortCriterion} from '@/src/internal/api/commerce-search/index.js';

export interface LoadSortActionsOptions {
  interface: Supports<'search'>;
}

export function loadSortActions(options: LoadSortActionsOptions) {
  const {engine, resolveFacades} = getHandleInternals(options.interface);

  engine.adoptSlice(getOrCreateSortSlice(options.interface));

  const thunks = resolveFacades('search');
  const sortActions = getOrCreateSortActions(options.interface);
  const selectors = getOrCreateSortSelectors(options.interface);

  return {
    sortBy(criterion: CommerceSearchSortCriterion) {
      engine.mutate(sortActions.sortBy(criterion));
      return Promise.all(thunks.map((thunk) => engine.mutate(thunk({engine}))));
    },
    getState() {
      return {
        appliedSort: engine.read(selectors.getAppliedSort),
        availableSorts: engine.read(selectors.getAvailableSorts),
      };
    },
  };
}
