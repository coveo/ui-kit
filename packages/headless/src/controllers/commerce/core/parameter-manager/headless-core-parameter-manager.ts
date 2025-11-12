import {RecordValue, Schema, type SchemaDefinition} from '@coveo/bueno';
import type {UnknownAction} from '@reduxjs/toolkit';
import type {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../app/state-key.js';
import type {Parameters} from '../../../../features/commerce/parameters/parameters-actions.js';
import {parametersReducer as commerceParameters} from '../../../../features/commerce/parameters/parameters-slice.js';
import type {CommerceParametersSection} from '../../../../state/state-sections.js';
import {deepEqualAnyOrder} from '../../../../utils/compare-utils.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {validateInitialState} from '../../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../../controller/headless-controller.js';
import type {FetchProductsActionCreator} from '../common.js';

export interface ParameterManagerProps<T extends Parameters> {
  /**
   * The initial state that should be applied to the `ParameterManager` sub-controller.
   */
  initialState?: ParameterManagerInitialState<T>;

  /**
   * Whether the controller's state should exclude the default parameters returned by the Commerce API, and only include
   * the parameters that were set explicitly set through dispatched actions.
   *
   * Defaults to `false`.
   */
  excludeDefaultParameters?: boolean;
}

export interface CoreParameterManagerProps<T extends Parameters>
  extends ParameterManagerProps<T> {
  /**
   * The definition of the parameters.
   */
  parametersDefinition: SchemaDefinition<Required<T>>;

  /**
   * The selector to retrieve the active parameters from the state.
   */
  activeParametersSelector: (state: CommerceEngine[typeof stateKey]) => T;

  /**
   * The action to dispatch to update the parameters in the state.
   */
  restoreActionCreator: (parameters: T) => UnknownAction;

  /**
   * The action to dispatch to fetch more results.
   */
  fetchProductsActionCreator: FetchProductsActionCreator;
}

export interface ParameterManagerInitialState<T> {
  /**
   * The parameters affecting the response.
   */
  parameters: T;
}

const initialStateSchema = <T extends Parameters>(
  parametersDefinition: SchemaDefinition<Required<T>>
) =>
  new Schema<Required<ParameterManagerInitialState<T>>>({
    parameters: new RecordValue({
      options: {required: true},
      values: parametersDefinition as SchemaDefinition<Record<string, Object>>,
    }),
  });

/**
 * The `ParameterManager` sub-controller allows restoring parameters that affect the results (for example, from the URL).
 *
 * @group Sub-controllers
 * @category ParameterManager
 */
export interface ParameterManager<T extends Parameters> extends Controller {
  /**
   * Updates the parameters in the state with the specified parameters and fetches results. Unspecified keys are reset to their initial values.
   *
   * @param parameters - The parameters to synchronize.
   */
  synchronize(parameters: T): void;

  /**
   * The state relevant to the `ParameterManager` sub-controller.
   */
  state: ParameterManagerState<T>;
}

/**
 * The state of the `ParameterManager` sub-controller.
 *
 * @group Sub-controllers
 * @category ParameterManager
 */
export interface ParameterManagerState<T extends Parameters> {
  /**
   * The parameters affecting the response.
   */
  parameters: T;
}

/**
 * @internal
 * Creates a `ParameterManager` sub-controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `ParameterManager` properties.
 * @returns A `ParameterManager` sub-controller instance.
 */
export function buildCoreParameterManager<T extends Parameters>(
  engine: CommerceEngine,
  props: CoreParameterManagerProps<T>
): ParameterManager<T> {
  if (props.excludeDefaultParameters && !loadParameterManagerReducers(engine)) {
    throw loadReducerError;
  }

  const parametersSelector = (state: CommerceEngineState) =>
    state.commerceParameters;

  const {dispatch} = engine;
  const controller = buildController(engine);

  if (props.initialState) {
    validateInitialState(
      engine,
      initialStateSchema(props.parametersDefinition),
      props.initialState,
      'buildCoreParameterManager'
    );
    dispatch(props.restoreActionCreator(props.initialState.parameters));
  }

  return {
    ...controller,

    synchronize(parameters: T) {
      const activeParams = props.activeParametersSelector(engine[stateKey]);

      // Always restore empty parameters or parameters that are different from the active ones.
      // We always restore empty parameters in commerce because they may correspond to navigation to a new page.
      if (
        Object.keys(parameters).length > 0 &&
        deepEqualAnyOrder(activeParams, parameters)
      ) {
        return;
      }

      dispatch(props.restoreActionCreator(parameters));
      dispatch(props.fetchProductsActionCreator());
    },

    get state() {
      return {
        parameters: props.excludeDefaultParameters
          ? (parametersSelector(engine[stateKey]) as T)
          : props.activeParametersSelector(engine[stateKey]),
      };
    },
  };
}

function loadParameterManagerReducers(
  engine: CommerceEngine
): engine is CommerceEngine<CommerceParametersSection> {
  engine.addReducers({
    commerceParameters,
  });
  return true;
}
