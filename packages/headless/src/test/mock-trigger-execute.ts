import {TriggerExecute} from '../../src/api/search/trigger';

export function buildMockExecuteTrigger(
  config: Partial<TriggerExecute> = {}
): TriggerExecute {
  return {
    type: 'execute',
    content: {name: '', params: ['']},
    ...config,
  };
}
