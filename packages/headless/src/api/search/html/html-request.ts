import type {BaseParam} from '../../platform-service-params.js';
import type {AuthenticationParam} from '../search-api-params.js';

export interface HtmlRequestOptions {
  uniqueId: string;
  requestedOutputSize?: number;
}

export type HtmlRequest = BaseParam &
  HtmlRequestOptions &
  AuthenticationParam & {
    enableNavigation: boolean;
    requestedOutputSize: number;
    q: string;
  };
