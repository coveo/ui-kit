import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import type {CommerceContextState} from './context-state.js';

export function getCurrency(state: CommerceContextState): CurrencyCodeISO4217 {
  return state.currency;
}
