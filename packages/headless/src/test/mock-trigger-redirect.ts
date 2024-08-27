import {TriggerRedirect} from '../api/common/trigger';

export function buildMockRedirectTrigger(
  config: Partial<TriggerRedirect> = {}
): TriggerRedirect {
  return {
    type: 'redirect',
    content: '',
    ...config,
  };
}
