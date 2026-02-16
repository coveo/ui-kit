import {Schema} from '@coveo/bueno';
import type {AsyncThunkAction} from '@reduxjs/toolkit';
import type {Result} from '../../../api/search/search/result.js';
import type {CoreEngine} from '../../../app/engine.js';
import type {
  ClickAction,
  CustomAction,
} from '../../../features/analytics/analytics-utils.js';
import {configurationReducer as configuration} from '../../../features/configuration/configuration-slice.js';
import {
  foldingOptionsSchemaDefinition,
  registerFolding,
} from '../../../features/folding/folding-actions.js';
import {foldingReducer as folding} from '../../../features/folding/folding-slice.js';
import type {
  CollectionId,
  FoldedCollection,
  FoldedResult,
} from '../../../features/folding/folding-state.js';
import {queryReducer as query} from '../../../features/query/query-slice.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import type {
  ConfigurationSection,
  FoldingSection,
  QuerySection,
  SearchSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {validateOptions} from '../../../utils/validate-payload.js';
import type {Controller} from '../../controller/headless-controller.js';
import {
  buildCoreResultList,
  type ResultListOptions,
} from '../result-list/headless-core-result-list.js';
import type {SearchStatusState} from '../status/headless-core-status.js';

export type {FoldedCollection, FoldedResult};

const optionsSchema = new Schema<Required<FoldingOptions>>(
  foldingOptionsSchemaDefinition
);

export interface FoldingOptions {
  /**
   * The name of the field on which to do the folding. The folded result list component will use the values of this field to resolve the collections of result items.
   *
   * @defaultValue `foldingcollection`
   */
  collectionField?: string;
  /**
   * The name of the field that determines whether a certain result is a top result containing other child results within a collection.
   *
   * @defaultValue `foldingparent`
   */
  parentField?: string;
  /**
   * The name of the field that uniquely identifies a result within a collection.
   *
   * @defaultValue `foldingchild`
   */
  childField?: string;
  /**
   * The number of child results to fold under the root collection element, before expansion.
   *
   * @defaultValue `2`
   */
  numberOfFoldedResults?: number;
}

export interface FoldedResultListOptions extends ResultListOptions {
  folding?: FoldingOptions;
}

export interface CoreFoldedResultListProps {
  /**
   * The options for the `FoldedResultList` controller.
   * */
  options?: FoldedResultListOptions;
  /**
   * The action creator to build the `loadCollection` action.
   */
  loadCollectionActionCreator: (
    collectionId: CollectionId
    // biome-ignore lint/suspicious/noExplicitAny: third-party API requires 'any'
  ) => AsyncThunkAction<any, CollectionId, any>;
  /**
   * The action creator to build the `fetchMoreResults` action.
   */

  // biome-ignore lint/suspicious/noExplicitAny: third-party API requires 'any'
  fetchMoreResultsActionCreator: () => AsyncThunkAction<unknown, void, any>;
}

/**
 * The `FoldedResultList` headless controller re-organizes results into hierarchical collections (a.k.a. threads).
 *
 * Example: [folded-result-list.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/folded-result-list/folded-result-list.fn.tsx)
 *
 * @group Controllers
 * @category FoldedResultList
 */
export interface FoldedResultList extends Controller {
  /**
   * The state of the `FoldedResultList` controller.
   */
  state: FoldedResultListState;
  /**
   * Using the same parameters as the last successful query, fetch another batch of results, if available.
   * Particularly useful for infinite scrolling, for example.
   *
   * This method is not compatible with the `Pager` controller.
   */
  fetchMoreResults(): void;
  /**
   * Loads all the folded results for a given collection.
   *
   * @param collection - The collection for which to load more results.
   */
  loadCollection(collection: FoldedCollection): void;
  /**
   * Logs a click event when a user loads/shows more folded results.
   *
   * @param result - The result to send analytics for.
   */
  logShowMoreFoldedResults(result: Result): void;
  /**
   * Logs a custom event when a user shows less folded results.
   *   */
  logShowLessFoldedResults(): void;
  /**
   * Finds a folded result by its unique ID.
   *
   * @param collection - The folded collection whose ID will be used to find a collection in the results.
   * @returns The `FoldedResult` associated with the collection's ID.
   */
  findResultById(collection: FoldedCollection): FoldedResult | null;
  /**
   * Finds a folded result by its collection.
   *
   * @param collection - The folded collection whose collection name will be used to find a collection in the results.
   * @returns The `FoldedResult` associated with the collection's name.
   */
  findResultByCollection(collection: FoldedCollection): FoldedResult | null;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `FoldedResultList` controller.
 *
 * @group Controllers
 * @category FoldedResultList
 */
export interface FoldedResultListState extends SearchStatusState {
  /**
   * The ordered list of collections.
   * */
  results: FoldedCollection[];
  /**
   * The unique identifier of the response where the results were fetched, this value does not change when loading more results.
   */
  searchResponseId: string;
  /**
   * Whether more results are available, using the same parameters as the last successful query.
   *
   * This property is not compatible with the `Pager` controller.
   */
  moreResultsAvailable: boolean;
}

interface FoldedResultAnalyticsClient {
  logShowMoreFoldedResults: (result: Result) => ClickAction;
  logShowLessFoldedResults: () => CustomAction;
}

/**
 * Creates a core `FoldedResultList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `FoldedResultList` properties.
 * @param analyticsClient - A FoldedResultAnalyticsClient to send the appropriate analytics calls.
 * @returns A `FoldedResultList` controller instance.
 *
 * @group Controllers
 * @category FoldedResultList
 */
export function buildCoreFoldedResultList(
  engine: CoreEngine,
  props: CoreFoldedResultListProps,
  analyticsClient: FoldedResultAnalyticsClient
): FoldedResultList {
  if (!loadFoldingReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildCoreResultList(engine, props);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = props.options?.folding
    ? validateOptions(
        engine,
        optionsSchema,
        props.options!.folding!,
        'buildFoldedResultList'
      )
    : {};

  dispatch(registerFolding({...options}));

  return {
    ...controller,

    loadCollection: (collection) => {
      dispatch(
        props.loadCollectionActionCreator(
          collection.result.raw[
            engine.state.folding.fields.collection
          ] as string
        )
      );
      dispatch(analyticsClient.logShowMoreFoldedResults(collection.result));
    },
    logShowMoreFoldedResults: (result) => {
      dispatch(analyticsClient.logShowMoreFoldedResults(result));
    },
    logShowLessFoldedResults: () => {
      dispatch(analyticsClient.logShowLessFoldedResults());
    },

    findResultById(collection) {
      return searchForResult(
        this.state.results,
        (r) => r.result.uniqueId === collection.result.uniqueId
      );
    },

    findResultByCollection(collection) {
      return searchForResult(
        this.state.results,
        (r) =>
          r.result.raw.foldingcollection ===
          collection.result.raw.foldingcollection
      );
    },

    get state() {
      const state = getState();

      return {
        ...controller.state,
        results: controller.state.results.map((result) => {
          const collectionId = result.raw[state.folding.fields.collection] as
            | string
            | undefined;
          if (!collectionId || !state.folding.collections[collectionId]) {
            return {
              result,
              moreResultsAvailable: false,
              isLoadingMoreResults: false,
              children: [],
            };
          }
          return state.folding.collections[collectionId];
        }),
      };
    },
  };
}

function loadFoldingReducer(
  engine: CoreEngine
): engine is CoreEngine<
  SearchSection & ConfigurationSection & FoldingSection & QuerySection
> {
  engine.addReducers({search, configuration, folding, query});
  return true;
}

function searchForResult(
  results: FoldedCollection[] | FoldedResult[],
  compareCb: (result: FoldedResult) => boolean
): FoldedResult | null {
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (compareCb(result)) {
      return result;
    }
    if (result.children.length) {
      const childResult = searchForResult(result.children, compareCb);
      if (childResult) {
        return childResult;
      }
    }
  }
  return null;
}
