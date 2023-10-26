import {
  UserParams,
  ViewParams,
} from '../../../api/commerce/commerce-api-params';

export interface CommerceContextState {
  trackingId: string;
  language: string;
  currency: string;
  clientId: string;
  user?: UserParams;
  view: ViewParams;
}

export const getContextInitialState = (): CommerceContextState => ({
  trackingId: '',
  language: '',
  currency: '',
  clientId: '',
  view: {
    url: '',
  },
});
