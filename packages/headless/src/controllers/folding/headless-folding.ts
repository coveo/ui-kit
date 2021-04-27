import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {search, configuration, folding} from '../../app/reducers';
import {registerFolding} from '../../features/folding/folding-actions';
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

const optionsSchema = new Schema<Required<FoldingOptions>>({
  collectionField: new StringValue(),
  parentField: new StringValue(),
  childField: new StringValue(),
  maximumFoldedResults: new NumberValue(),
});

export interface FoldingOptions {
  /**
   * The name of the field used to resolve what collection a result is part of.
   *
   * @defaultValue `foldedcollection`
   */
  collectionField?: string;
  /**
   * The name of the field used to reference which result is the parent of another one within a collection.
   *
   * @defaultValue `foldedparent`
   */
  parentField?: string;
  /**
   * The name of the field used to uniquely identify a result within a collection.
   *
   * @defaultValue `foldedchild`
   */
  childField?: string;
  /**
   * The maximum number of additional results to fetch from the same collection
   * as the most relevant result, excluding the root result of the collection.
   *
   * @defaultValue `2`
   */
  maximumFoldedResults?: number;
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
  props?: FoldingProps
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
    props?.options,
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
