import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {
  UserParams,
  ViewParams,
} from '../../../api/commerce/commerce-api-params';

export interface CommerceContextState {
  trackingId: string;
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  user?: UserParams;
  view: ViewParams;
}

export const getContextInitialState = (): CommerceContextState => ({
  trackingId: '',
  language: '',
  country: '',
  currency: '' as CurrencyCodeISO4217,
  view: {
    url: '',
  },
});
