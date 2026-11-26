import type {BaseParam} from '../../platform-service-params.js';
import type {AuthenticationParam} from '../search-api-params.js';

export interface HtmlRequestOptions {
  uniqueId: string;
  requestedOutputSize?: number;
  /**
   * Whether the Search API wraps the query terms in highlight tags in the returned HTML.
   *
   * When `false`, the query is not sent and the document is returned as indexed.
   *
   * @defaultValue `true`
   */
  highlightTerms?: boolean;
}

export type HtmlRequest = BaseParam &
  Omit<HtmlRequestOptions, 'highlightTerms'> &
  AuthenticationParam & {
    enableNavigation: boolean;
    requestedOutputSize: number;
    q: string;
  };
