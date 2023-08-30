import {CommerceAPIClient} from '../api/commerce/commerce-api-client';
import {ClientThunkExtraArguments} from './thunk-extra-arguments';

export interface CommerceThunkExtraArguments
  extends ClientThunkExtraArguments<CommerceAPIClient> {}
