import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {
  UserParams,
  ViewParams,
} from '../../../api/commerce/commerce-api-params.js';

export type UserState = Required<Pick<UserParams, 'latitude' | 'longitude'>>;

export interface CommerceContextState {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  view: ViewParams;
  user?: UserState;
}

export const getContextInitialState = (): CommerceContextState => ({
  language: '',
  country: '',
  currency: '' as CurrencyCodeISO4217,
  view: {
    url: '',
  },
});
