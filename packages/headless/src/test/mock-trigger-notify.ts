import type {TriggerNotify} from '../api/common/trigger.js';

export function buildMockNotifyTrigger(
  config: Partial<TriggerNotify> = {}
): TriggerNotify {
  return {
    type: 'notify',
    content: '',
    ...config,
  };
}
