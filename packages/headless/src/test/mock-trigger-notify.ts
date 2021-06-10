import {TriggerNotify} from '../../src/api/search/trigger';

export function buildMockTriggerNotify(
  config: Partial<TriggerNotify> = {}
): TriggerNotify {
  return {
    type: 'notify',
    content: '',
    ...config,
  };
}
