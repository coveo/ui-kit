import {
  ActionsHistoryParam,
  BaseParam,
  ContextParam,
  FieldsToIncludeParam,
  LocaleParam,
  MachineLearningParam,
  NumberOfResultsParam,
  RecommendationParam,
  SearchHubParam,
  VisitorIDParam,
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
  LocaleParam;
