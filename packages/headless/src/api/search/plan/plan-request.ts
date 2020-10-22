import {
  BaseParam,
  ContextParam,
  PipelineParam,
  QueryParam,
  SearchHubParam,
} from '../search-api-request';

export type PlanRequest = BaseParam &
  SearchHubParam &
  ContextParam &
  QueryParam &
  PipelineParam;
