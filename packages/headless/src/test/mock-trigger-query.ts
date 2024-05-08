import {TriggerQuery} from '../api/common/trigger';

export function buildMockQueryTrigger(
  config: Partial<TriggerQuery> = {}
): TriggerQuery {
  return {
    type: 'query',
    content: '',
    ...config,
  };
}
