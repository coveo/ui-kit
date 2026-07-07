import type {SearchBoxState} from '@/src/internal/features/search-box/index.js';
import type {CartState} from '@/src/internal/features/cart/index.js';
import type {ConfigurationState} from '@/src/internal/features/configuration/index.js';
import type {FacetState} from '@/src/internal/features/facets/index.js';
import type {NavigatorContextProvider} from '@/src/internal/utils/index.js';
import type {PaginationState} from '@/src/internal/features/pagination/index.js';
import type {ResultListState} from '@/src/internal/features/result-list/index.js';

export interface State {
  cart?: CartState;
  configuration?: ConfigurationState;
  facets?: Record<string, FacetState>;
  pagination?: PaginationState;
  results?: ResultListState;
  searchBox?: SearchBoxState;
  [key: string]: unknown;
}

/**
 * Function that selects a value from state
 *
 * @template T The type of value selected from state
 * @param state The current application state
 * @returns The selected value
 */
export type StateSelector<T> = {
  bivarianceHack(state: State): T;
}['bivarianceHack'];

/**
 * A state mutation object
 *
 * Library-agnostic representation of a state change.
 * Does NOT expose Redux action types.
 */
export interface StateMutation {
  /** Mutation type identifier */
  type: string;
  /** Optional mutation payload */
  payload?: unknown;
}

/**
 * A dispatchable value — either a plain mutation or an async thunk action.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dispatchable = StateMutation | ((...args: any[]) => any);

/**
 * Function to unsubscribe from state changes
 */
export type Unsubscribe = () => void;

/**
 * Callback invoked when subscribed state changes
 *
 * @template T The type of value being observed
 * @param value The new value
 */
export type StateChangeCallback<T> = (value: T) => void;

export interface EngineOptions {
  /**
   * The initial configuration state.
   */
  configuration?: ConfigurationState;

  /**
   * The navigator context provider function.
   */
  navigatorContextProvider?: NavigatorContextProvider;
}
