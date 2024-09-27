import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {ViewParams} from '../../../api/commerce/commerce-api-params.js';

export interface CommerceContextState {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  view: ViewParams;
}

export const getContextInitialState = (): CommerceContextState => ({
  language: '',
  country: '',
  currency: '' as CurrencyCodeISO4217,
  view: {
    url: '',
  },
});
