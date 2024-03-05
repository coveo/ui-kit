import {
  UserParams,
  ViewParams,
} from '../../../api/commerce/commerce-api-params';

export interface CommerceContextState {
  trackingId: string;
  language: string;
  country: string;
  currency: string;
  user?: UserParams;
  view: ViewParams;
}

export const getContextInitialState = (): CommerceContextState => ({
  trackingId: '',
  language: '',
  country: '',
  currency: '',
  view: {
    url: '',
  },
});
