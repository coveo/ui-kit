import {RecordValue, Schema, SchemaDefinition} from '@coveo/bueno';
import {AnyAction, AsyncThunkAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {Parameters} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {deepEqualAnyOrder} from '../../../../utils/compare-utils';
import {validateInitialState} from '../../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';

export interface ParameterManagerProps<T extends Parameters> {
  /**
   * The initial state that should be applied to the `ParameterManager` controller.
   */
  initialState: ParameterManagerInitialState<T>;
}

interface CoreParameterManagerProps<T extends Parameters>
  extends ParameterManagerProps<T> {
  /**
   * The definition of the parameters.
   */
  parametersDefinition: SchemaDefinition<Required<T>>;

  /**
   * The selector to retrieve the active parameters from the state.
   */
  activeParametersSelector: (state: CommerceEngine['state']) => T;

  /**
   * The action to dispatch to update the parameters in state.
   */
  restoreActionCreator: (parameters: T) => AnyAction;

  /**
   * The action to dispatch to fetch more results.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchResultsActionCreator: () => AsyncThunkAction<unknown, void, any>;

  /**
   * Enriches the parameters with the active parameters.
   * @param state
   * @param activeParams
   */
  enrichParameters(
    state: CommerceEngine['state'],
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
 * The `ParameterManager` controller allows restoring parameters that affect the results from e.g. a url.
 * */
export interface ParameterManager<T extends Parameters> extends Controller {
  /**
   * Updates the search parameters in state with the passed parameters and executes a search. Unspecified keys are reset to their initial values.
   *
   * @param parameters - The search parameters to synchronize.
   */
  synchronize(parameters: T): void;

  /**
   * The state relevant to the `SearchParameterManager` controller.
   * */
  state: ParameterManagerState<T>;
}

export interface ParameterManagerState<T extends Parameters> {
  /**
   * The parameters affecting the search response.
   */
  parameters: T;
}

/**
 * @internal
 * Creates a `ParameterManager` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `ParameterManager` properties.
 * @returns A `ParameterManager` controller instance.
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
      const activeParams = props.activeParametersSelector(engine.state);
      const oldParams = props.enrichParameters(engine.state, activeParams);
      const newParams = props.enrichParameters(engine.state, parameters);

      if (deepEqualAnyOrder(oldParams, newParams)) {
        return;
      }

      dispatch(props.restoreActionCreator(parameters));
      dispatch(props.fetchResultsActionCreator());
    },

    get state() {
      const parameters = props.activeParametersSelector(engine.state);
      return {parameters};
    },
  };
}
