import {BaseParam, ContextParam} from '../../platform-service-params';
import {
  ActionsHistoryParam,
  AdvancedQueryParam,
  ConstantQueryParam,
  FieldsToIncludeParam,
  PipelineParam,
  RecommendationParam,
  ReferrerParam,
  SearchHubParam,
  TabParam,
} from '../search-api-params';

export type RecommendationRequest = BaseParam &
  RecommendationParam &
  SearchHubParam &
  PipelineParam &
  ContextParam &
  FieldsToIncludeParam &
  AdvancedQueryParam &
  ConstantQueryParam &
  ActionsHistoryParam &
  TabParam &
  ReferrerParam;
