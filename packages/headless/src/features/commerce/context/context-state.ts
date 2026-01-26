import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import type {
  UserParams,
  ViewParams,
} from '../../../api/commerce/commerce-api-params.js';

export type LocationState = Required<
  Pick<UserParams, 'latitude' | 'longitude'>
>;

/**
 * Custom context state that accepts JSON-serializable values.
 * Values should be primitives (string, number, boolean, null) or nested objects/arrays of primitives.
 * Detailed validation is performed by the backend.
 */
export interface CustomContextState {
  [key: string]: unknown;
}

export interface CommerceContextState {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  view: ViewParams;
  location?: LocationState;
  custom?: CustomContextState;
}

export const getContextInitialState = (): CommerceContextState => ({
  language: '',
  country: '',
  currency: '' as CurrencyCodeISO4217,
  view: {
    url: '',
  },
});
