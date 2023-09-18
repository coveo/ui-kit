import {ContextParams} from '../../../api/commerce/commerce-api-params';

export interface CommerceContextState {
  trackingId: string;
  language: string;
  currency: string;
  // TODO: Does it make sense for the clientId to be part of the context state?
  clientId: string;
  context: ContextParams; // TODO: Should this be spread in its parent instead?
}

export const getContextInitialState = (): CommerceContextState => ({
  trackingId: '',
  language: '',
  currency: '',
  clientId: '',
  context: {
    view: {
      url: '',
    },
  },
});
