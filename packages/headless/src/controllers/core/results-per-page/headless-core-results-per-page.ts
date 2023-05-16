import {NumberValue, Schema} from '@coveo/bueno';
import {configuration} from '../../../app/common-reducers';
import {CoreEngine} from '../../../app/engine';
import {
  registerNumberOfResults,
  updateNumberOfResults,
} from '../../../features/pagination/pagination-actions';
import {paginationReducer as pagination} from '../../../features/pagination/pagination-slice';
import {
  ConfigurationSection,
  PaginationSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {validateInitialState} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

const initialStateSchema = new Schema({
  numberOfResults: new NumberValue({min: 0}),
});

export interface ResultsPerPageProps {
  /**
   * The initial state that should be applied to this `ResultsPerPage` controller.
   */
  initialState?: ResultsPerPageInitialState;
}

export interface ResultsPerPageInitialState {
  /**
   * The initial number of results to register in state.
   */
  numberOfResults?: number;
}

/**
 * The `ResultsPerPage` controller allows the end user to choose how many results to display per page.
 */
export interface ResultsPerPage extends Controller {
  /**
   * Updates the number of results to request per page.
   *
   * @param num - The number of results.
   */
  set(num: number): void;

  /** Checks whether the number of results per page is equal to the specified number.
   *
   * @param num - The number of results.
   * @returns `true` if the number of results is equal to the passed value, and `false` otherwise.
   */
  isSetTo(num: number): boolean;

  /**
   * The state of the `ResultsPerPage` controller.
   */
  state: ResultsPerPageState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `ResultsPerPage` controller.
 * */
export interface ResultsPerPageState {
  /**
   * The number of results per page.
   * */
  numberOfResults: number;
}

/**
 * Creates a `ResultsPerPage` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `ResultsPerPage` properties.
 * @returns A `ResultsPerPage` controller instance.
 */
export function buildCoreResultsPerPage(
  engine: CoreEngine,
  props: ResultsPerPageProps = {}
): ResultsPerPage {
  if (!loadResultsPerPageReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const validated = validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildResultsPerPage'
  );

  const num = validated.numberOfResults;

  if (num !== undefined) {
    dispatch(registerNumberOfResults(num));
  }

  return {
    ...controller,

    get state() {
      return {
        numberOfResults: getState().pagination.numberOfResults,
      };
    },

    set(num: number) {
      dispatch(updateNumberOfResults(num));
    },

    isSetTo(num: number) {
      return num === this.state.numberOfResults;
    },
  };
}

function loadResultsPerPageReducers(
  engine: CoreEngine
): engine is CoreEngine<PaginationSection & ConfigurationSection> {
  engine.addReducers({pagination, configuration});
  return true;
}
