import {BaseParam, VisitorIDParam} from '../../platform-service-params';

export interface HtmlRequestOptions {
  uniqueId: string;
  requestedOutputSize?: number;
}

export type HtmlRequest = BaseParam &
  HtmlRequestOptions &
  VisitorIDParam & {
    enableNavigation: boolean;
    requestedOutputSize: number;
    q: string;
  };
