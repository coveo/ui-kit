import {TriggerRedirect} from '../../src/api/search/trigger';

export function buildMockTriggerRedirect(
  config: Partial<TriggerRedirect> = {}
): TriggerRedirect {
  return {
    type: 'redirect',
    content: '',
    ...config,
  };
}
