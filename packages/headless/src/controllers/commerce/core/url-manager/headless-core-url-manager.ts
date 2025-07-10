import type {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../app/state-key.js';
import type {Parameters} from '../../../../features/commerce/parameters/parameters-actions.js';
import type {Serializer} from '../../../../features/commerce/parameters/parameters-serializer.js';
import {deepEqualAnyOrder} from '../../../../utils/compare-utils.js';
import {validateInitialState} from '../../../../utils/validate-payload.js';
import {buildController} from '../../../controller/headless-controller.js';
import {
  type UrlManagerProps as BaseUrlManagerProps,
  initialStateSchema,
  type UrlManager,
  type UrlManagerInitialState,
  type UrlManagerState,
} from '../../../url-manager/headless-url-manager.js';
import type {
  ParameterManager,
  ParameterManagerProps,
} from '../parameter-manager/headless-core-parameter-manager.js';

export type {
  UrlManager,
  UrlManagerInitialState,
  UrlManagerState,
  BaseUrlManagerProps,
};

export interface UrlManagerProps extends BaseUrlManagerProps {
  /**
   * Whether the controller's state should exclude the default parameters returned by the Commerce API, and only include
   * the parameters that were set explicitly set through dispatched actions.
   *
   * Defaults to `false`.
   */
  excludeDefaultParameters?: boolean;
}

interface CoreUrlManagerProps<T extends Parameters> extends UrlManagerProps {
  requestIdSelector: (state: CommerceEngine[typeof stateKey]) => string;
  parameterManagerBuilder: (
    engine: CommerceEngine,
    props: ParameterManagerProps<T>
  ) => ParameterManager<T>;
  serializer: Serializer<T>;
}

/**
 * @internal
 * Creates a `UrlManager` sub-controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `UrlManager` properties.
 * @returns A `UrlManager` sub-controller instance.
 */
export function buildCoreUrlManager<T extends Parameters>(
  engine: CommerceEngine,
  props: CoreUrlManagerProps<T>
): UrlManager {
  let lastRequestId: string;

  function updateLastRequestId() {
    lastRequestId = props.requestIdSelector(engine[stateKey]);
  }

  function hasRequestIdChanged() {
    return lastRequestId !== props.requestIdSelector(engine[stateKey]);
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
    excludeDefaultParameters: props.excludeDefaultParameters ?? false,
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
