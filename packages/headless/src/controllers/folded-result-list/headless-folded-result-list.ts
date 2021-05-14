import {Schema} from '@coveo/bueno';
import {Result} from '../../api/search/search/result';
import {Engine} from '../../app/headless-engine';
import {search, configuration, folding} from '../../app/reducers';
import {
  foldingOptionsSchemaDefinition,
  loadCollection,
  registerFolding,
} from '../../features/folding/folding-actions';
import {Collection, FoldedResult} from '../../features/folding/folding-state';
import {
  ConfigurationSection,
  FoldingSection,
  SearchSection,
} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {validateOptions} from '../../utils/validate-payload';
import {
  buildResultList,
  ResultList,
  ResultListOptions,
  ResultListState,
} from '../result-list/headless-result-list';

export {Collection, FoldedResult};

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
export interface FoldedResultList extends ResultList {
  /**
   * Loads all the folded results for a given collection.
   */
  loadCollection(collection: Collection): void;
  /**
   * The state of the `FoldedResultList` controller.
   */
  state: FoldedResultListState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `FoldedResultList` controller.
 * */
export interface FoldedResultListState extends ResultListState {
  /**
   * The ordered list of results and collections.
   * */
  results: (Collection | Result)[];
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

    loadCollection: (collection) =>
      dispatch(
        loadCollection(
          collection.raw[engine.state.folding.fields.collection] as string
        )
      ),

    get state() {
      const state = getState();

      return {
        ...controller.state,
        results: controller.state.results.map((result) => {
          const collectionId = result.raw[state.folding.fields.collection] as
            | string
            | undefined;
          if (!collectionId) {
            return result;
          }
          return state.folding.collections[collectionId] ?? result;
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
