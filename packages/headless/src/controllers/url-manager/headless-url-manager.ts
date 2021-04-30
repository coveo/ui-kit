import {Schema, StringValue} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {restoreSearchParameters} from '../../features/search-parameters/search-parameter-actions';
import {SearchParametersState} from '../../state/search-app-state';
import {validateInitialState} from '../../utils/validate-payload';
import {buildController, Controller} from '../controller/headless-controller';
import {executeSearch} from '../../features/search/search-actions';
import {ConfigurationSection} from '../../state/state-sections';
import {buildSearchParameterSerializer} from '../../features/search-parameters/search-parameter-serializer';
import {buildSearchParameterManager} from '../search-parameter-manager/headless-search-parameter-manager';
import {logParametersChange} from '../../features/search-parameters/search-parameter-analytics-actions';
import {initialSearchParameterSelector} from '../../features/search-parameters/search-parameter-selectors';
import {configuration} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';

export interface UrlManagerProps {
  /**
   * The initial state that should be applied to the `UrlManager` controller.
   */
  initialState: UrlManagerInitialState;
}

export interface UrlManagerInitialState {
  /**
   * The part of the url that contains search parameters.
   * E.g., `q=windmill&f[author]=Cervantes`
   */
  fragment: string;
}

const initialStateSchema = new Schema<Required<UrlManagerInitialState>>({
  fragment: new StringValue(),
});

/**
 * The `UrlManager` controller can parse an url fragment to extract search parameters which affect the search response.
 * */
export interface UrlManager extends Controller {
  /**
   * The state relevant to the `UrlManager` controller.
   * */
  state: UrlManagerState;
  /**
   * Updates the search parameters in state with those from the url & launches a search.
   * @param fragment The part of the url that contains search parameters.  E.g., `q=windmill&f[author]=Cervantes`
   */
  synchronize(fragment: string): void;
}

export interface UrlManagerState {
  /**
   * The part of the url that contains search parameters.
   * E.g., `q=windmill&f[author]=Cervantes`
   */
  fragment: string;
}

/**
 * Creates a `UrlManager` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `UrlManager` properties.
 * @returns A `UrlManager` controller instance.
 */
export function buildUrlManager(
  engine: Engine<object>,
  props: UrlManagerProps
): UrlManager {
  if (!loadUrlManagerReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);

  validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildUrlManager'
  );

  const searchParameterManager = buildSearchParameterManager(engine, {
    initialState: {
      parameters: fragmentActiveSearchParameters(props.initialState.fragment),
    },
  });

  return {
    subscribe: controller.subscribe,

    get state() {
      return {
        fragment: buildSearchParameterSerializer().serialize(
          searchParameterManager.state.parameters
        ),
      };
    },

    synchronize(fragment: string) {
      const initialParameters = initialSearchParameterSelector(engine.state);
      const previousParameters = {
        ...initialParameters,
        ...searchParameterManager.state.parameters,
      };
      const newParameters = {
        ...initialParameters,
        ...fragmentActiveSearchParameters(fragment),
      };
      dispatch(restoreSearchParameters(newParameters));
      dispatch(
        executeSearch(logParametersChange(previousParameters, newParameters))
      );
    },
  };
}

function fragmentActiveSearchParameters(fragment: string) {
  const decodedState = decodeURIComponent(fragment);
  return buildSearchParameterSerializer().deserialize(decodedState);
}

function loadUrlManagerReducers(
  engine: Engine<object>
): engine is Engine<Partial<SearchParametersState> & ConfigurationSection> {
  engine.addReducers({configuration});
  return true;
}
