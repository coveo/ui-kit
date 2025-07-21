import type {CommerceAPIClient} from '../api/commerce/commerce-api-client.js';
import type {ClientThunkExtraArguments} from './thunk-extra-arguments.js';

export interface CommerceThunkExtraArguments
  extends ClientThunkExtraArguments<CommerceAPIClient> {}
