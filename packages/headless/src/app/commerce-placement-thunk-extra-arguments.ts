import {CommerceUnifiedAPIClient} from '../api/commerce/unified-api/unified-api-client';
import {ClientThunkExtraArguments} from './thunk-extra-arguments';

export interface CommercePlacementsThunkExtraArguments
  extends ClientThunkExtraArguments<CommerceUnifiedAPIClient> {}
