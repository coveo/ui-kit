import {
  BaseParam,
  ContextParam,
  PipelineParam,
  QueryParam,
  SearchHubParam,
} from '../search-api-params';

export type PlanRequest = BaseParam &
  SearchHubParam &
  ContextParam &
  QueryParam &
  PipelineParam;
