import {
  ActionsHistoryParam,
  BaseParam,
  ContextParam,
  LocaleParam,
  PipelineParam,
  QueryParam,
  SearchHubParam,
} from '../search-api-params';

export type QuerySuggestRequest = BaseParam &
  QueryParam &
  ContextParam &
  PipelineParam &
  SearchHubParam &
  LocaleParam &
  ActionsHistoryParam & {
    count: number;
  };
