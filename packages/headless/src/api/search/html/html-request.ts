import {BaseParam} from '../search-api-params';

export interface HtmlRequestOptions {
  uniqueId: string;
}

export type HtmlRequest = BaseParam &
  HtmlRequestOptions & {
    enableNavigation: boolean;
    requestedOutputSize: number;
    q: string;
  };
