import {TriggerNotify} from '../api/common/trigger';

export function buildMockNotifyTrigger(
  config: Partial<TriggerNotify> = {}
): TriggerNotify {
  return {
    type: 'notify',
    content: '',
    ...config,
  };
}
