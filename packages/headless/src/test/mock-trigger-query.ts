import {TriggerQuery} from '../../src/api/search/trigger';

export function buildMockQueryTrigger(
  config: Partial<TriggerQuery> = {}
): TriggerQuery {
  return {
    type: 'query',
    content: '',
    ...config,
  };
}
