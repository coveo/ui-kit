import type {CaseAssistAPIClient} from '../api/service/case-assist/case-assist-api-client.js';
import type {ClientThunkExtraArguments} from './thunk-extra-arguments.js';

export interface CaseAssistThunkExtraArguments
  extends ClientThunkExtraArguments<CaseAssistAPIClient> {}
