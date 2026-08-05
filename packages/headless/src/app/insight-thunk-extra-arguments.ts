import type {InsightAPIClient} from '../api/service/insight/insight-api-client.js';
import type {GeneratedAnswerAnalyticsClient} from '../features/generated-answer/generated-answer-analytics-client.js';
import type {ClientThunkExtraArguments} from './thunk-extra-arguments.js';

export interface InsightThunkExtraArguments extends ClientThunkExtraArguments<InsightAPIClient> {
  generatedAnswerAnalyticsClient: GeneratedAnswerAnalyticsClient;
}
