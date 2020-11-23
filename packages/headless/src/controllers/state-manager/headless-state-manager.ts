import {Engine} from '../../app/headless-engine';
import {getQueryInitialState} from '../../features/query/query-state';
import {
  restoreStateAsync,
  StateParameters,
} from '../../features/state-manager/state-manager-actions';
import {SearchAppState} from '../../state/search-app-state';
import {buildController} from '../controller/headless-controller';

export interface StateManagerProps {
  initialState: StateManagerInitialState;
}

interface StateManagerInitialState {
  parameters: StateParameters;
}

/** The `StateManger` controller allows changing parameters that affect the results.*/
export type StateManager = ReturnType<typeof buildStateManager>;

/** The state relevant to the `StateManger` controller.*/
export type StateManagerState = StateManager['state'];

export function buildStateManager(
  engine: Engine<Partial<SearchAppState>>,
  props: StateManagerProps
) {
  const {dispatch} = engine;
  const controller = buildController(engine);

  dispatch(restoreStateAsync(props.initialState.parameters));

  return {
    ...controller,

    get state() {
      const state = engine.state;
      const parameters = {
        ...getQ(state),
      };

      return {parameters};
    },
  };
}

function getQ(state: Partial<SearchAppState>) {
  if (state.query === undefined) {
    return {};
  }

  const shouldIncludeQ = state.query.q !== getQueryInitialState().q;
  return shouldIncludeQ ? {q: state.query.q} : {};
}
