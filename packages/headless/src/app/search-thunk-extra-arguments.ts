import type {GeneratedAnswerAPIClient} from '../api/generated-answer/generated-answer-client.js';
import type {SearchAPIClient} from '../api/search/search-api-client.js';
import type {GeneratedAnswerAnalyticsClient} from '../features/generated-answer/generated-answer-analytics-client.js';
import type {ClientThunkExtraArguments} from './thunk-extra-arguments.js';

export interface SearchThunkExtraArguments extends ClientThunkExtraArguments<
  SearchAPIClient,
  GeneratedAnswerAPIClient
> {
  generatedAnswerAnalyticsClient: GeneratedAnswerAnalyticsClient;
}
