import {StaticFilterValue} from '../features/static-filter-set/static-filter-set-state';

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
