import type {StaticFilterSlice} from '../features/static-filter-set/static-filter-set-state.js';

export function buildMockStaticFilterSlice(
  config: Partial<StaticFilterSlice> = {}
): StaticFilterSlice {
  return {
    id: '',
    values: [],
    ...config,
  };
}
