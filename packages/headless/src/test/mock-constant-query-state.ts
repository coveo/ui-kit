import {ConstantQueryState} from '../state';

export function buildMockConstantQueryState(
  config: Partial<ConstantQueryState> = {}
): ConstantQueryState {
  return {
    cq: '',
    isInitialized: false,
    ...config,
  };
}
