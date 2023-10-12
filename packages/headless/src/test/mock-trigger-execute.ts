import {TriggerExecute} from '../../src/api/search/trigger.js';

export function buildMockExecuteTrigger(
  config: Partial<TriggerExecute> = {}
): TriggerExecute {
  return {
    type: 'execute',
    content: {name: '', params: []},
    ...config,
  };
}
