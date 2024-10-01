import {InsightAPIClient} from '../api/service/insight/insight-api-client.js';
import {ClientThunkExtraArguments} from './thunk-extra-arguments.js';

export interface InsightThunkExtraArguments
  extends ClientThunkExtraArguments<InsightAPIClient> {}
