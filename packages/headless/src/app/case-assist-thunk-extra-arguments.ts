import {CaseAssistAPIClient} from '../api/service/case-assist/case-assist-api-client';
import {ClientThunkExtraArguments} from './thunk-extra-arguments';

export interface CaseAssistThunkExtraArguments
  extends ClientThunkExtraArguments<CaseAssistAPIClient> {}
