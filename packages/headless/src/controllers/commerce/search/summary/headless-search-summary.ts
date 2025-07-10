import type {SummaryState} from '../../core/summary/headless-core-summary.js';

export interface SearchSummaryState extends SummaryState {
  /**
   * The search query.
   */
  query: string;
}
