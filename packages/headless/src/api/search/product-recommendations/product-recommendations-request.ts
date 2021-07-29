import {
  BaseParam,
  ContextParam,
  LocaleParam,
  NumberOfResultsParam,
  VisitorIDParam,
} from '../../platform-service-params';
import {
  ActionsHistoryParam,
  FieldsToIncludeParam,
  MachineLearningParam,
  RecommendationParam,
  SearchHubParam,
  TimezoneParam,
} from '../search-api-params';

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
