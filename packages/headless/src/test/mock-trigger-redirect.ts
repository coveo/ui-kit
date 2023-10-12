import {TriggerRedirect} from '../../src/api/search/trigger.js';

export function buildMockRedirectTrigger(
  config: Partial<TriggerRedirect> = {}
): TriggerRedirect {
  return {
    type: 'redirect',
    content: '',
    ...config,
  };
}
