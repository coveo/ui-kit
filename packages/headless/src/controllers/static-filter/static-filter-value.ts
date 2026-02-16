import type {
  StaticFilterValue,
  StaticFilterValueState,
} from '../../features/static-filter-set/static-filter-set-state.js';

export interface StaticFilterValueOptions {
  /**
   * A human-readable caption for the expression (for example, `Youtube`).
   */
  caption: string;

  /**
   * The query filter expression to apply when the value is selected (for example, `@filetype=="youtubevideo"`).
   */
  expression: string;

  /**
   * The state of the static filter value. The possible values are `idle`, `selected`, `excluded`.
   */
  state?: StaticFilterValueState;
}

/**
 * Creates a `StaticFilterValue`.
 *
 * @param config - The options with which to create a `StaticFilterValue`.
 * @returns A new `StaticFilterValue`.
 */
export function buildStaticFilterValue(
  config: StaticFilterValueOptions
): StaticFilterValue {
  return {
    state: 'idle',
    ...config,
  };
}
