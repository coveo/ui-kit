import {RecordValue, Schema} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {getQueryInitialState} from '../../features/query/query-state';
import {
  restoreState,
  StateParameters,
} from '../../features/state-manager/state-manager-actions';
import {stateParametersDefinition} from '../../features/state-manager/state-parameters-schema';
import {SearchParametersState} from '../../state/search-app-state';
import {validateInitialState} from '../../utils/validate-payload';
import {buildController} from '../controller/headless-controller';

export interface StateManagerProps {
  initialState: StateManagerInitialState;
}

interface StateManagerInitialState {
  parameters: StateParameters;
}

const initialStateSchema = new Schema<Required<StateManagerInitialState>>({
  parameters: new RecordValue({
    options: {required: true},
    values: stateParametersDefinition,
  }),
});

/** The `StateManager` controller allows restoring parameters that affect the results from e.g. a url.*/
export type StateManager = ReturnType<typeof buildStateManager>;

/** The state relevant to the `StateManager` controller.*/
export type StateManagerState = StateManager['state'];

export function buildStateManager(
  engine: Engine<Partial<SearchParametersState>>,
  props: StateManagerProps
) {
  const {dispatch} = engine;
  const controller = buildController(engine);

  validateInitialState(
    initialStateSchema,
    props.initialState,
    buildStateManager.name
  );
  dispatch(restoreState(props.initialState.parameters));

  return {
    ...controller,

    get state() {
      const state = engine.state;
      const parameters: StateParameters = {
        ...getQ(state),
      };

      return {parameters};
    },
  };
}

function getQ(state: Partial<SearchParametersState>) {
  if (state.query === undefined) {
    return {};
  }

  const shouldIncludeQ = state.query.q !== getQueryInitialState().q;
  return shouldIncludeQ ? {q: state.query.q} : {};
}
