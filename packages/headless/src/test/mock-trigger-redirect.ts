import type {TriggerRedirect} from '../api/common/trigger.js';

export function buildMockRedirectTrigger(
  config: Partial<TriggerRedirect> = {}
): TriggerRedirect {
  return {
    type: 'redirect',
    content: '',
    ...config,
  };
}
