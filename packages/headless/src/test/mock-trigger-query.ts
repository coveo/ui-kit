import {TriggerQuery} from '../../src/api/search/trigger';

export function buildMockTriggerQuery(
  config: Partial<TriggerQuery> = {}
): TriggerQuery {
  return {
    type: 'query',
    content: '',
    ...config,
  };
}
