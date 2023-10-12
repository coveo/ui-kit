import {TriggerNotify} from '../../src/api/search/trigger.js';

export function buildMockNotifyTrigger(
  config: Partial<TriggerNotify> = {}
): TriggerNotify {
  return {
    type: 'notify',
    content: '',
    ...config,
  };
}
