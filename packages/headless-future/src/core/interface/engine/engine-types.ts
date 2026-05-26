import {SearchBoxState} from '../../internal/search-box/search-box-slice.js';
import {SearchEndpointState} from '../api/search-endpoint/search-endpoint-types.js';
import {CartState} from '../cart/cart-types.js';
import {ConfigurationState} from '../configuration/configuration-types.js';
import {ConversationState} from '../conversation/conversation-types.js';
import {FacetState} from '../facets/facets-types.js';
import {NavigatorContextProvider} from '../navigator-context/navigator-context-types.js';
import {PaginationState} from '../pagination/pagination-types.js';
import {ResultListState} from '../result-list/result-list-types.js';

export interface State {
  cart?: CartState;
  configuration?: ConfigurationState;
  conversation?: ConversationState;
  facets?: Record<string, FacetState>;
  pagination?: PaginationState;
  results?: ResultListState;
  searchEndpoint?: SearchEndpointState;
  searchBox?: SearchBoxState;
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
