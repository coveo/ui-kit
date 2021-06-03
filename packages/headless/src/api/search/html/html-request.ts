import {BaseParam} from '../../platform-service-params';

export interface HtmlRequestOptions {
  uniqueId: string;
  requestedOutputSize?: number;
}

export type HtmlRequest = BaseParam &
  HtmlRequestOptions & {
    enableNavigation: boolean;
    requestedOutputSize: number;
    q: string;
  };
