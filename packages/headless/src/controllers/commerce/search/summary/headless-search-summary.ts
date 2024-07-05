import {SummaryState} from '../../core/summary/headless-core-summary';

export interface SearchSummaryState extends SummaryState {
  /**
   * The search query.
   */
  query: string;
}
