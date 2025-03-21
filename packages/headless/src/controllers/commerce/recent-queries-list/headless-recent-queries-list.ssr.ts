import {NonRecommendationControllerDefinitionWithProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  createControllerWithKind,
  Kind,
} from '../../../app/commerce-ssr-engine/types/kind.js';
import {MissingControllerProps} from '../../../utils/errors.js';
import {
  RecentQueriesList,
  RecentQueriesListProps,
  buildRecentQueriesList,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
} from './headless-recent-queries-list.js';

export type {
  RecentQueriesState,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
} from './headless-recent-queries-list.js';
export type {RecentQueriesList, RecentQueriesListProps};

export interface RecentQueriesListBuildProps {
  initialState: RecentQueriesListInitialState;
}

export interface RecentQueriesListDefinition
  extends NonRecommendationControllerDefinitionWithProps<
    RecentQueriesList,
    RecentQueriesListBuildProps
  > {}

/**
 * Defines the `RecentQueriesList` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @param props - The configuration `RecentQueriesList` properties.
 * @returns The `RecentQueriesList` controller definition.
 */
export function defineRecentQueriesList(
  options?: RecentQueriesListOptions
): RecentQueriesListDefinition {
  return {
    search: true,
    listing: true,
    standalone: true,
    buildWithProps: (engine, props) => {
      if (props === undefined) {
        throw new MissingControllerProps(Kind.RecentQueriesList);
      }
      const controller = buildRecentQueriesList(engine, {options, ...props});
      return createControllerWithKind(controller, Kind.RecentQueriesList);
    },
  };
}
