import {
  BaseParam,
  ContextParam,
  LocaleParam,
  NumberOfResultsParam,
  VisitorIDParam,
} from '../../platform-service-params.js';
import {
  ActionsHistoryParam,
  FieldsToIncludeParam,
  MachineLearningParam,
  RecommendationParam,
  SearchHubParam,
  TimezoneParam,
} from '../search-api-params.js';

export type ProductRecommendationsRequest = BaseParam &
  FieldsToIncludeParam &
  NumberOfResultsParam &
  MachineLearningParam &
  RecommendationParam &
  ContextParam &
  SearchHubParam &
  ActionsHistoryParam &
  VisitorIDParam &
  LocaleParam &
  TimezoneParam;
