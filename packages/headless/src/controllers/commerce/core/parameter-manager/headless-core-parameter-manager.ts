import {RecordValue, Schema, SchemaDefinition} from '@coveo/bueno';
import {UnknownAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../app/state-key.js';
import {Parameters} from '../../../../features/commerce/parameters/parameters-actions.js';
import {deepEqualAnyOrder} from '../../../../utils/compare-utils.js';
import {validateInitialState} from '../../../../utils/validate-payload.js';
import {
  Controller,
  buildController,
} from '../../../controller/headless-controller.js';
import {FetchProductsActionCreator} from '../common.js';

export interface ParameterManagerProps<T extends Parameters> {
  /**
   * The initial state that should be applied to the `ParameterManager` sub-controller.
   */
  initialState: ParameterManagerInitialState<T>;
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

  /**
   * Enriches the parameters with the active parameters.
   * @param state
   * @param activeParams
   */
  enrichParameters(
    state: CommerceEngine[typeof stateKey],
    activeParams: T
  ): Required<T>;
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
 * The `ParameterManager` sub-controller allows restoring parameters that affect the results (e.g., from the URL).
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
  const {dispatch} = engine;
  const controller = buildController(engine);

  validateInitialState(
    engine,
    initialStateSchema(props.parametersDefinition),
    props.initialState,
    'buildCoreParameterManager'
  );
  dispatch(props.restoreActionCreator(props.initialState.parameters));

  return {
    ...controller,

    synchronize(parameters: T) {
      const activeParams = props.activeParametersSelector(engine[stateKey]);
      const oldParams = props.enrichParameters(engine[stateKey], activeParams);
      const newParams = props.enrichParameters(engine[stateKey], parameters);

      if (deepEqualAnyOrder(oldParams, newParams)) {
        return;
      }

      dispatch(props.restoreActionCreator(parameters));
      dispatch(props.fetchProductsActionCreator());
    },

    get state() {
      const parameters = props.activeParametersSelector(engine[stateKey]);
      return {parameters};
    },
  };
}
