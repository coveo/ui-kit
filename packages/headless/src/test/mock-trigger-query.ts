import type {TriggerQuery} from '../api/common/trigger.js';

export function buildMockQueryTrigger(
  config: Partial<TriggerQuery> = {}
): TriggerQuery {
  return {
    type: 'query',
    content: '',
    ...config,
  };
}
