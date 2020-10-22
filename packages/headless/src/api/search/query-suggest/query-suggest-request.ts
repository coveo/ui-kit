import {
  BaseParam,
  ContextParam,
  PipelineParam,
  QueryParam,
  SearchHubParam,
} from '../search-api-request';

export type QuerySuggestRequest = BaseParam &
  QueryParam &
  ContextParam &
  PipelineParam &
  SearchHubParam & {
    count: number;
  };
