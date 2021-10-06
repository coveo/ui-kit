import {TabSlice} from '../features/tab-set/tab-set-state';

export function buildMockTabSlice(config: Partial<TabSlice>): TabSlice {
  return {
    id: '',
    expression: '',
    isActive: false,
    ...config,
  };
}
