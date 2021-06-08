import {Schema} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {search, configuration, folding} from '../../app/reducers';
import {
  foldingOptionsSchemaDefinition,
  loadCollection,
  registerFolding,
} from '../../features/folding/folding-actions';
import {
  FoldedCollection,
  FoldedResult,
} from '../../features/folding/folding-state';
import {
  ConfigurationSection,
  FoldingSection,
  SearchSection,
} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {validateOptions} from '../../utils/validate-payload';
import {Controller} from '../controller/headless-controller';
import {
  buildResultList,
  ResultListOptions,
} from '../result-list/headless-result-list';
import {SearchStatusState} from '../search-status/headless-search-status';

export {FoldedCollection, FoldedResult};

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

export interface FoldedResultListProps {
  /**
   * The options for the `FoldedResultList` controller.
   * */
  options?: FoldedResultListOptions;
}

/**
 * The `FoldedResultList` headless controller re-organizes results into hierarchical collections (a.k.a. threads).
 */
export interface FoldedResultList extends Controller {
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
   * The state of the `FoldedResultList` controller.
   */
  state: FoldedResultListState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `FoldedResultList` controller.
 * */
export interface FoldedResultListState extends SearchStatusState {
  /**
   * The ordered list of collections.
   * */
  results: FoldedCollection[];
  /**
   * The unique identifier of the last executed search.
   */
  searchUid: string;
  /**
   * Whether more results are available, using the same parameters as the last successful query.
   *
   * This property is not compatible with the `Pager` controller.
   */
  moreResultsAvailable: boolean;
}

/**
 * Creates a `FoldedResultList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `FoldedResultList` properties.
 * @returns A `FoldedResultList` controller instance.
 */
export function buildFoldedResultList(
  engine: Engine<object>,
  props: FoldedResultListProps = {}
): FoldedResultList {
  if (!loadFoldingReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildResultList(engine, props);
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
        loadCollection(
          collection.result.raw[
            engine.state.folding.fields.collection
          ] as string
        )
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
  engine: Engine<object>
): engine is Engine<SearchSection & ConfigurationSection & FoldingSection> {
  engine.addReducers({search, configuration, folding});
  return true;
}
