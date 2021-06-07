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
import {configuration} from '../../app/reducers';
import {initialSearchParameterSelector} from '../../features/search-parameters/search-parameter-selectors';
import {loadReducerError} from '../../utils/errors';
import {deepEqualAnyOrder} from '../../utils/compare-utils';
import {logParametersChange} from '../../features/search-parameters/search-parameter-analytics-actions';

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

  validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildUrlManager'
  );

  const completeParameters = (fragment: string) => ({
    ...initialSearchParameterSelector(engine.state),
    ...deserializeFragment(fragment),
  });

  const controller = buildController(engine);
  const {dispatch} = engine;
  let previousFragment = decodeFragment(props.initialState.fragment);
  const searchParameterManager = buildSearchParameterManager(engine, {
    initialState: {
      parameters: deserializeFragment(previousFragment),
    },
  });

  return {
    ...controller,

    subscribe(listener: () => void) {
      const strictListener = () => {
        const newFragment = this.state.fragment;
        if (!areFragmentsEquivalent(previousFragment, newFragment)) {
          previousFragment = newFragment;
          listener();
        }
      };
      strictListener();
      return engine.subscribe(strictListener);
    },

    get state() {
      return {
        fragment: buildSearchParameterSerializer().serialize(
          searchParameterManager.state.parameters
        ),
      };
    },

    synchronize(fragment: string) {
      const newFragment = decodeFragment(fragment);
      if (areFragmentsEquivalent(previousFragment, newFragment)) {
        return;
      }

      const completePreviousParameters = completeParameters(previousFragment);
      const completeNewParameters = completeParameters(newFragment);
      previousFragment = newFragment;

      dispatch(restoreSearchParameters(completeNewParameters));
      dispatch(
        executeSearch(
          logParametersChange(completePreviousParameters, completeNewParameters)
        )
      );
    },
  };
}

function areFragmentsEquivalent(fragment1: string, fragment2: string) {
  if (fragment1 === fragment2) {
    return true;
  }

  const params1 = deserializeFragment(fragment1);
  const params2 = deserializeFragment(fragment2);
  return deepEqualAnyOrder(params1, params2);
}

function decodeFragment(fragment: string) {
  return decodeURIComponent(fragment);
}

function deserializeFragment(fragment: string) {
  return buildSearchParameterSerializer().deserialize(fragment);
}

function loadUrlManagerReducers(
  engine: Engine<object>
): engine is Engine<Partial<SearchParametersState> & ConfigurationSection> {
  engine.addReducers({configuration});
  return true;
}
