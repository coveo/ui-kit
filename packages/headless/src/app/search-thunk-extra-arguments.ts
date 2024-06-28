import {LegacyGeneratedAnswerAPIClient} from '../api/generated-answer/generated-answer-client';
import {SearchAPIClient} from '../api/search/search-api-client';
import {ClientThunkExtraArguments} from './thunk-extra-arguments';

export interface SearchThunkExtraArguments
  extends ClientThunkExtraArguments<
    SearchAPIClient,
    LegacyGeneratedAnswerAPIClient
  > {}
