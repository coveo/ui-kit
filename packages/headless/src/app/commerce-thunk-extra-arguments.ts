import {CommerceAPIClient} from '../api/commerce/commerce-api-client.js';
import {ClientThunkExtraArguments} from './thunk-extra-arguments.js';

export interface CommerceThunkExtraArguments
  extends ClientThunkExtraArguments<CommerceAPIClient> {}
