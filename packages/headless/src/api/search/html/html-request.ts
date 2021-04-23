import {BaseParam} from '../../platform-service-params';

export interface HtmlRequestOptions {
  uniqueId: string;
}

export type HtmlRequest = BaseParam &
  HtmlRequestOptions & {
    enableNavigation: boolean;
    requestedOutputSize: number;
    q: string;
  };
