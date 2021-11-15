import {
  BaseParam,
  ContextParam,
  LocaleParam,
  VisitorIDParam,
} from '../../platform-service-params';
import {
  ActionsHistoryParam,
  PipelineParam,
  QueryParam,
  SearchHubParam,
  TimezoneParam,
} from '../search-api-params';

export type QuerySuggestRequest = BaseParam &
  QueryParam &
  ContextParam &
  PipelineParam &
  SearchHubParam &
  LocaleParam &
  TimezoneParam &
  ActionsHistoryParam &
  VisitorIDParam & {
    count: number;
  };
