import {Schema} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {search, configuration, folding} from '../../app/reducers';
import {
  foldingOptionsSchemaDefinition,
  loadAll,
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
  resultListOptionsSchemaDefinition,
  ResultListState,
} from '../result-list/headless-result-list';

export {Collection, FoldedResult};

const optionsSchema = new Schema<Required<FoldedResultListOptions>>({
  ...resultListOptionsSchemaDefinition,
  ...foldingOptionsSchemaDefinition,
});

export interface FoldedResultListOptions extends ResultListOptions {
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
  loadAll(collection: string | Collection): void;
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
   * The unsorted hierarchical collections of results.
   * */
  results: Collection[];
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

  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildFoldedResultList'
  );

  dispatch(registerFolding({...options}));

  return {
    ...controller,

    loadAll: (collection) =>
      dispatch(
        loadAll(
          typeof collection === 'string'
            ? collection
            : (collection.raw[engine.state.folding.fields.collection] as string)
        )
      ),

    get state() {
      const state = getState();

      return {
        ...controller.state,
        results: state.folding.collections,
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
