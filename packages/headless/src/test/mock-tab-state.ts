import type {TabSlice} from '../features/tab-set/tab-set-state.js';

export function buildMockTabSlice(config: Partial<TabSlice>): TabSlice {
  return {
    id: '',
    expression: '',
    isActive: false,
    ...config,
  };
}
