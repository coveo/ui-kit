import {Schema, StringValue} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {restoreSearchParameters} from '../../features/search-parameters/search-parameter-actions';
import {SearchParametersState} from '../../state/search-app-state';
import {validateInitialState} from '../../utils/validate-payload';
import {buildController, Controller} from '../controller/headless-controller';
import {executeSearch} from '../../features/search/search-actions';
import {ConfigurationSection} from '../../state/state-sections';
import {buildSearchParameterSerializer} from '../../features/search-parameters/search-parameter-serializer';
import {
  buildSearchParameterManager,
  getInitialSearchParameterState,
} from '../search-parameter-manager/headless-search-parameter-manager';
import {getParametersChangeAnalyticsAction} from './headless-url-manager-analytics';

export interface UrlManagerProps {
  /**
   * The initial state that should be applied to the `UrlManager` controller.
   */
  initialState: UrlManagerInitialState;
}

export interface UrlManagerInitialState {
  /**
   * The part of the url containing the parameters affecting the search response.
   */
  fragment: string;
}

const initialStateSchema = new Schema<Required<UrlManagerInitialState>>({
  fragment: new StringValue(),
});

/**
 * The `UrlManager` controller allows managing an url which affect the search response.
 * */
export interface UrlManager extends Controller {
  /**
   * The state relevant to the `UrlManager` controller.
   * */
  state: UrlManagerState;
  /**
   * Updates the search parameters from the url & launches a search.
   * @param fragment The part of the url containing the parameters affecting the search.
   */
  submitChanges(fragment: string): void;
}

export interface UrlManagerState {
  /**
   * The part of the url containing the parameters affecting the search.
   */
  url: string;
}

/**
 * Creates a `UrlManager` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `UrlManager` properties.
 * @returns A `UrlManager` controller instance.
 */
export function buildUrlManager(
  engine: Engine<Partial<SearchParametersState> & ConfigurationSection>,
  props: UrlManagerProps
): UrlManager {
  const {dispatch} = engine;
  const controller = buildController(engine);

  validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildUrlManager'
  );

  const parameters = {
    ...getInitialSearchParameterState(engine),
    ...getSearchParameterStateFromFragment(props.initialState.fragment),
  };
  const searchParameterManager = buildSearchParameterManager(engine, {
    initialState: {
      parameters,
    },
  });

  return {
    ...controller,

    get state() {
      return {
        url: buildSearchParameterSerializer().serialize(
          searchParameterManager.state.parameters
        ),
      };
    },

    submitChanges(fragment: string) {
      const initialParameters = getInitialSearchParameterState(engine);
      const previousParameters = {
        ...initialParameters,
        ...searchParameterManager.state.parameters,
      };
      const newParameters = {
        ...initialParameters,
        ...getSearchParameterStateFromFragment(fragment),
      };
      dispatch(restoreSearchParameters(newParameters));
      dispatch(
        executeSearch(
          getParametersChangeAnalyticsAction(previousParameters, newParameters)
        )
      );
    },
  };
}

function getSearchParameterStateFromFragment(fragment: string) {
  const decodedState = decodeURIComponent(fragment);
  return buildSearchParameterSerializer().deserialize(decodedState);
}
