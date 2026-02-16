import {Schema, StringValue} from '@coveo/bueno';
import {configuration} from '../../app/common-reducers.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {buildSearchParameterSerializer} from '../../features/search-parameters/search-parameter-serializer.js';
import type {SearchParametersState} from '../../state/search-app-state.js';
import type {ConfigurationSection} from '../../state/state-sections.js';
import {deepEqualAnyOrder} from '../../utils/compare-utils.js';
import {loadReducerError} from '../../utils/errors.js';
import {validateInitialState} from '../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../controller/headless-controller.js';
import {buildSearchParameterManager} from '../search-parameter-manager/headless-search-parameter-manager.js';

export interface UrlManagerProps {
  /**
   * The initial state that should be applied to the `UrlManager` controller.
   */
  initialState: UrlManagerInitialState;
}

export interface UrlManagerInitialState {
  /**
   * The part of the url that contains search parameters.
   * For example: `q=windmill&f[author]=Cervantes`.
   */
  fragment: string;
}

export const initialStateSchema = new Schema<Required<UrlManagerInitialState>>({
  fragment: new StringValue(),
});

/**
 * The `UrlManager` controller can parse an url fragment to extract search parameters which affect the search response.
 *
 * Example: [url-manager.ts](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/url-manager/url-manager.ts)
 *
 * @group Controllers
 * @category UrlManager
 * */
export interface UrlManager extends Controller {
  /**
   * The state relevant to the `UrlManager` controller.
   * */
  state: UrlManagerState;

  /**
   * Updates the search parameters in state with those from the url and launches a search.
   * @param fragment The part of the url that contains search parameters.  For example: `q=windmill&f[author]=Cervantes`.
   */
  synchronize(fragment: string): void;
}

/**
 * A scoped and simplified part of the Headless state that is relevant to the `UrlManager` controller.
 *
 * @group Controllers
 * @category UrlManager
 */
export interface UrlManagerState {
  /**
   * The part of the url that contains search parameters.
   * For example: `q=windmill&f[author]=Cervantes`.
   */
  fragment: string;
}

/**
 * Creates a `UrlManager` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `UrlManager` properties.
 * @returns A `UrlManager` controller instance.
 *
 * @group Controllers
 * @category UrlManager
 */
export function buildUrlManager(
  engine: SearchEngine,
  props: UrlManagerProps
): UrlManager {
  let lastRequestId: string;

  function updateLastRequestId() {
    lastRequestId = engine.state.search.requestId;
  }

  function hasRequestIdChanged() {
    return lastRequestId !== engine.state.search.requestId;
  }

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
  updateLastRequestId();

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
        if (
          !areFragmentsEquivalent(previousFragment, newFragment) &&
          hasRequestIdChanged()
        ) {
          previousFragment = newFragment;
          listener();
        }
        updateLastRequestId();
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
