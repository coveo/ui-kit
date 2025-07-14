import type {StaticFilterValue} from '../features/static-filter-set/static-filter-set-state.js';

export function buildMockStaticFilterValue(
  config: Partial<StaticFilterValue> = {}
): StaticFilterValue {
  return {
    caption: '',
    expression: '',
    state: 'idle',
    ...config,
  };
}
