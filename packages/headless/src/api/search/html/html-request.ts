import {BaseParam, VisitorIDParam} from '../../platform-service-params';
import {AuthenticationParam} from '../search-api-params';

export interface HtmlRequestOptions {
  uniqueId: string;
  requestedOutputSize?: number;
}

export type HtmlRequest = BaseParam &
  HtmlRequestOptions &
  AuthenticationParam &
  VisitorIDParam & {
    enableNavigation: boolean;
    requestedOutputSize: number;
    q: string;
  };
