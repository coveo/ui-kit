import {Schema} from '@coveo/bueno';
import {Engine} from '../../app/engine';
import {search, configuration, folding} from '../../app/reducers';
import {
  foldingOptionsSchema,
  registerFolding,
} from '../../features/folding/folding-actions';
import {FoldedResult} from '../../features/folding/folding-state';
import {
  ConfigurationSection,
  FoldingSection,
  SearchSection,
} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {validateOptions} from '../../utils/validate-payload';
import {buildController, Controller} from '../controller/headless-controller';

export {FoldedResult};

const optionsSchema = new Schema<Required<FoldingOptions>>(
  foldingOptionsSchema
);

export interface FoldingOptions {
  /**
   * The name of the field on which to do the folding. The folding component will use the values of this field to resolve the collections of result items.
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

export interface FoldingProps {
  /**
   * The options for the `Folding` controller.
   * */
  options?: FoldingOptions;
}

/**
 * The `Folding` headless controller re-organizes results into hierarchical collections (a.k.a. threads).
 */
export interface Folding extends Controller {
  /**
   * The state of the `Folding` controller.
   */
  state: FoldingState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `Folding` controller.
 * */
export interface FoldingState {
  /**
   * The unsorted hierarchical collections of results.
   * */
  collections: FoldedResult[];
}

/**
 * Creates a `Folding` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Folding` properties.
 * @returns A `Folding` controller instance.
 */
export function buildFolding(
  engine: Engine<object>,
  props: FoldingProps = {}
): Folding {
  if (!loadFoldingReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildFolding'
  );

  dispatch(registerFolding({...options}));

  return {
    ...controller,

    get state() {
      const state = getState();

      return {
        collections: state.folding.collections,
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
