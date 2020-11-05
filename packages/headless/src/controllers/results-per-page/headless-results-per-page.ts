import {Engine} from '../../app/headless-engine';
import {
  registerNumberOfResults,
  updateNumberOfResults,
} from '../../features/pagination/pagination-actions';
import {logPagerResize} from '../../features/pagination/pagination-analytics-actions';
import {executeSearch} from '../../features/search/search-actions';
import {
  ConfigurationSection,
  PaginationSection,
} from '../../state/state-sections';
import {buildController} from '../controller/headless-controller';

export interface ResultsPerPageProps {
  initialState: Partial<ResultsPerPageInitialState>;
}

export interface ResultsPerPageInitialState {
  numberOfResults: number;
}

/**
 * The ResultsPerPage component allows the end user to choose how many results to display per page.
 */
export type ResultsPerPage = ReturnType<typeof buildResultsPerPage>;
/** The state relevant to the `ResultsPerPage` controller.*/
export type ResultsPerPageState = ResultsPerPage['state'];

export const buildResultsPerPage = (
  engine: Engine<PaginationSection & ConfigurationSection>,
  props: Partial<ResultsPerPageProps> = {}
) => {
  const controller = buildController(engine);
  const {dispatch} = engine;

  const num = props.initialState?.numberOfResults;

  if (num !== undefined) {
    dispatch(registerNumberOfResults(num));
  }

  return {
    ...controller,

    /**
     * @returns The state of the `ResultsPerPage` controller.
     */
    get state() {
      return {
        numberOfResults: engine.state.pagination.numberOfResults,
      };
    },

    /** Updates the number of results to request
     * @param number The number of results.
     */
    set(num: number) {
      dispatch(updateNumberOfResults(num));
      dispatch(executeSearch(logPagerResize()));
    },

    /** Returns `true` if the number of results is equal to the passed value, and `false` otherwise.
     * @returns boolean
     */
    isSetTo(num: number) {
      return num === this.state.numberOfResults;
    },
  };
};
