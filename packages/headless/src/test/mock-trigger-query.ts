import {TriggerQuery} from '../../src/api/search/trigger.js';

export function buildMockQueryTrigger(
  config: Partial<TriggerQuery> = {}
): TriggerQuery {
  return {
    type: 'query',
    content: '',
    ...config,
  };
}
