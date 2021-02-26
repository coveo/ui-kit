import {
  ActionsHistoryParam,
  BaseParam,
  ContextParam,
  LocaleParam,
  MachineLearningParam,
  NumberOfResultsParam,
  RecommendationParam,
  SearchHubParam,
  VisitorIDParam,
} from '../search-api-params';

export type ProductRecommendationsRequest = BaseParam &
  NumberOfResultsParam &
  MachineLearningParam &
  RecommendationParam &
  ContextParam &
  SearchHubParam &
  ActionsHistoryParam &
  VisitorIDParam &
  LocaleParam;
