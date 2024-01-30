import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../../app/common-reducers';
import {Parameters} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {Serializer} from '../../../../features/commerce/search-parameters/search-parameter-serializer';
import {
  CommerceProductListingParametersState,
  CommerceSearchParametersState,
} from '../../../../state/commerce-app-state';
import {ConfigurationSection} from '../../../../state/state-sections';
import {deepEqualAnyOrder} from '../../../../utils/compare-utils';
import {loadReducerError} from '../../../../utils/errors';
import {validateInitialState} from '../../../../utils/validate-payload';
import {buildController} from '../../../controller/headless-controller';
import {
  initialStateSchema,
  UrlManager,
  UrlManagerInitialState,
  UrlManagerState,
  type UrlManagerProps,
} from '../../../url-manager/headless-url-manager';
import {
  ParameterManager,
  ParameterManagerProps,
} from '../parameter-manager/headless-core-parameter-manager';

export type {
  UrlManagerProps,
  UrlManager,
  UrlManagerInitialState,
  UrlManagerState,
};

interface CoreUrlManagerProps<T extends Parameters> extends UrlManagerProps {
  requestIdSelector: (state: CommerceEngine['state']) => string;
  parameterManagerBuilder: (
    engine: CommerceEngine,
    props: ParameterManagerProps<T>
  ) => ParameterManager<T>;
  serializer: Serializer<T>;
}

/**
 * @internal
 * Creates a `UrlManager` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `UrlManager` properties.
 * @returns A `UrlManager` controller instance.
 */
export function buildCoreUrlManager<T extends Parameters>(
  engine: CommerceEngine,
  props: CoreUrlManagerProps<T>
): UrlManager {
  let lastRequestId: string;

  function updateLastRequestId() {
    lastRequestId = props.requestIdSelector(engine.state);
  }

  function hasRequestIdChanged() {
    return lastRequestId !== props.requestIdSelector(engine.state);
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

  const parameterManager = props.parameterManagerBuilder(engine, {
    initialState: {
      parameters: props.serializer.deserialize(previousFragment),
    },
  });

  return {
    ...controller,

    subscribe(listener: () => void) {
      const strictListener = () => {
        const newFragment = this.state.fragment;
        if (
          !areFragmentsEquivalent(
            props.serializer.deserialize,
            previousFragment,
            newFragment
          ) &&
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
        fragment: props.serializer.serialize(parameterManager.state.parameters),
      };
    },

    synchronize(fragment: string) {
      previousFragment = fragment;

      const parameters = props.serializer.deserialize(fragment);
      parameterManager.synchronize(parameters);
    },
  };
}

function areFragmentsEquivalent<T>(
  deserialize: (fragment: string) => T,
  fragment1: string,
  fragment2: string
) {
  if (fragment1 === fragment2) {
    return true;
  }

  const params1 = deserialize(fragment1);
  const params2 = deserialize(fragment2);
  return deepEqualAnyOrder(params1, params2);
}

function loadUrlManagerReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  Partial<
    CommerceSearchParametersState | CommerceProductListingParametersState
  > &
    ConfigurationSection
> {
  engine.addReducers({configuration});
  return true;
}
