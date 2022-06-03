import {InsightAPIClient} from '../api/service/insight/insight-api-client';
import {ClientThunkExtraArguments} from './thunk-extra-arguments';

export interface InsightThunkExtraArguments
  extends ClientThunkExtraArguments<InsightAPIClient> {
    apiClient: InsightAPIClient;
  }
