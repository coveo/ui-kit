import {GeneratedAnswerAPIClient} from '../api/generated-answer/generated-answer-client.js';
import {SearchAPIClient} from '../api/search/search-api-client.js';
import {ClientThunkExtraArguments} from './thunk-extra-arguments.js';

export interface SearchThunkExtraArguments
  extends ClientThunkExtraArguments<
    SearchAPIClient,
    GeneratedAnswerAPIClient
  > {}
