import {
  ActionsHistoryParam,
  BaseParam,
  ContextParam,
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
  VisitorIDParam;
