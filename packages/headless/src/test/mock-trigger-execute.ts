import type {TriggerExecute} from '../api/common/trigger.js';

export function buildMockExecuteTrigger(
  config: Partial<TriggerExecute> = {}
): TriggerExecute {
  return {
    type: 'execute',
    content: {name: '', params: []},
    ...config,
  };
}
