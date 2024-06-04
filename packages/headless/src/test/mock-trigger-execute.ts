import {TriggerExecute} from '../api/common/trigger';

export function buildMockExecuteTrigger(
  config: Partial<TriggerExecute> = {}
): TriggerExecute {
  return {
    type: 'execute',
    content: {name: '', params: []},
    ...config,
  };
}
