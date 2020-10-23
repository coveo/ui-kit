import {
  BaseParam,
  ContextParam,
  PipelineParam,
  QueryParam,
  SearchHubParam,
} from '../search-api-params';

export type QuerySuggestRequest = BaseParam &
  QueryParam &
  ContextParam &
  PipelineParam &
  SearchHubParam & {
    count: number;
  };
