import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {CommerceContextState} from './context-state.js';

export function getCurrency(state: CommerceContextState): CurrencyCodeISO4217 {
  return state.currency;
}
