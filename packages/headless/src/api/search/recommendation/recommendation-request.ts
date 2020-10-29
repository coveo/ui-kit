import {
  ActionsHistoryParam,
  AdvancedQueryParam,
  BaseParam,
  ConstantQueryParam,
  ContextParam,
  FieldsToIncludeParam,
  PipelineParam,
  RecommendationParam,
  SearchHubParam,
} from '../search-api-params';

export type RecommendationRequest = BaseParam &
  RecommendationParam &
  SearchHubParam &
  PipelineParam &
  ContextParam &
  FieldsToIncludeParam &
  AdvancedQueryParam &
  ConstantQueryParam &
  ActionsHistoryParam;
