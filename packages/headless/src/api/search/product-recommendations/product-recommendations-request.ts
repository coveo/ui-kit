import {
  ActionsHistoryParam,
  BaseParam,
  ContextParam,
  MachineLearningParam,
  MaximumAgeParam,
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
  MaximumAgeParam &
  ActionsHistoryParam &
  VisitorIDParam;
