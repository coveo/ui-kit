import {
  attachedResultsApi,
  fetchAttachedResults,
  selectAttachedResults,
} from '../../../api/attachedResults/attached-results-api.js';
import {configuration} from '../../../app/common-reducers.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {
  goToPage,
  nextPage,
  previousPage,
} from '../../../features/attached-results/attached-results-actions.js';
import {attachedResultsReducer as attachedResults} from '../../../features/attached-results/attached-results-slice.js';
import type {
  AttachedResultsSection,
  ConfigurationSection,
  InsightConfigurationSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';

// import {createAsyncThunk} from '@reduxjs/toolkit';

// export const triggerFetchAttachedResults = createAsyncThunk<
//   void,
//   {caseId: string}
// >('attachedResults/fetch', async ({caseId}, {dispatch}) => {
//   // Fire the RTK Query initiate thunk
//   await dispatch(fetchAttachedResults());

//   // Optional: do other state updates after fetching
//   console.log('Attached results fetched for case', caseId);
// });

export interface AttachedResultsProps {
  /**
   * The options for the `AttachedResults` controller.
   */
  options: AttachedResultsOptions;
}

export interface AttachedResultsOptions {
  /**
   * The Id of the case to attach to.
   */
  caseId: string;
}

/**
 * The AttachedResults controller is responsible for handling the attach and detach actions on a specific result.
 * It also provides a function `isAttached` to verify if currently a specific result is part of the attachedResults state.
 *
 * @group Controllers
 * @category AttachedResults
 */
export interface AttachedResults extends Controller {
  setAttachedResults(): void;
  fetchAttachedResults(): void;
  nextPage(): void;
  previousPage(): void;
  goToPage(page: number): void;
}

/**
 *
 * @param engine - The headless engine.
 * @param props - The configurable `AttachedResults` properties.
 * @returns - A `AttachedResults` controller instance.
 *
 * @group Controllers
 * @category AttachedResults
 */
export function buildAttachedResults(
  engine: InsightEngine,
  props: AttachedResultsProps
): AttachedResults {
  if (!loadAttachedResultsReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const getState = () => engine.state.attachedResults;
  const controller = buildController(engine);
  const {caseId} = props.options;

  return {
    ...controller,

    get state() {
      const attachedResultsApiState = selectAttachedResults(
        caseId,
        engine.state
      ).data;
      return {
        ...getState(),
        // Here I will be returning the attached results API state
        ...attachedResultsApiState,
      };
    },

    setAttachedResults() {
      console.log('setAttachedResults');
      // dispatch the already existing setAttachedResults action
    },

    fetchAttachedResults() {
      dispatch(fetchAttachedResults(caseId, engine.state));
    },

    // Here I should expose methods to play with the pagination, next, previous, go to page, etc.
    nextPage() {
      dispatch(nextPage());
      dispatch(fetchAttachedResults(caseId, engine.state));
    },
    previousPage() {
      dispatch(previousPage());
      dispatch(fetchAttachedResults(caseId, engine.state));
    },
    goToPage(page: number) {
      dispatch(goToPage(page));
      dispatch(fetchAttachedResults(caseId, engine.state));
    },
  };
}

function loadAttachedResultsReducers(
  engine: InsightEngine
): engine is InsightEngine<
  ConfigurationSection &
    AttachedResultsSection &
    InsightConfigurationSection & {
      attachedResultsApi: ReturnType<typeof attachedResultsApi.reducer>;
    }
> {
  engine.addReducers({
    configuration,
    attachedResults,
    [attachedResultsApi.reducerPath]: attachedResultsApi.reducer,
  });

  return true;
}
