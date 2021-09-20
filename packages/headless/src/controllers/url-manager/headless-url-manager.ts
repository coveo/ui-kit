import {Schema, StringValue} from '@coveo/bueno';
import {SearchParametersState} from '../../state/search-app-state';
import {validateInitialState} from '../../utils/validate-payload';
import {buildController, Controller} from '../controller/headless-controller';
import {ConfigurationSection} from '../../state/state-sections';
import {buildSearchParameterSerializer} from '../../features/search-parameters/search-parameter-serializer';
import {buildSearchParameterManager} from '../search-parameter-manager/headless-search-parameter-manager';
import {configuration} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {deepEqualAnyOrder} from '../../utils/compare-utils';
import {SearchEngine} from '../../app/search-engine/search-engine';

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
  engine: SearchEngine,
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

  const controller = buildController(engine);
  let previousFragment = props.initialState.fragment;
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
      previousFragment = fragment;

      const parameters = deserializeFragment(fragment);
      searchParameterManager.synchronize(parameters);
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

function deserializeFragment(fragment: string) {
  return buildSearchParameterSerializer().deserialize(fragment);
}

function loadUrlManagerReducers(
  engine: SearchEngine
): engine is SearchEngine<
  Partial<SearchParametersState> & ConfigurationSection
> {
  engine.addReducers({configuration});
  return true;
}
