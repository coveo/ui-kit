import {Reducer, AnyAction} from 'redux';

export const makeHistory = <State>(state?: State): StateWithHistory<State> => ({
  past: [],
  present: state,
  future: [],
});

export interface StateWithHistory<State> {
  past: State[];
  present?: State;
  future: State[];
}

const undo = <State>(
  state: StateWithHistory<State>
): StateWithHistory<State> => {
  const {past, present, future} = state;
  if (!present) {
    return state;
  }

  if (past.length === 0) {
    return state;
  }

  const previous = past[past.length - 1];
  const newPast = past.slice(0, past.length - 1);
  return {
    past: newPast,
    present: previous,
    future: [present, ...future],
  };
};

const redo = <State>(
  state: StateWithHistory<State>
): StateWithHistory<State> => {
  const {past, present, future} = state;
  if (!present) {
    return state;
  }

  if (future.length === 0) {
    return state;
  }

  const next = future[0];
  const newFuture = future.slice(1);
  return {
    past: [...past, present],
    present: next,
    future: newFuture,
  };
};

const updateHistory = <State>(options: {
  state: StateWithHistory<State>;
  reducer: Reducer<State>;
  action: AnyAction;
}) => {
  const {action, state, reducer} = options;
  const {past, present} = state;
  const newPresent = reducer(present, action);
  if (!present) {
    return makeHistory(newPresent);
  }

  if (present === newPresent) {
    return state;
  }

  return {
    past: [...past, present],
    present: newPresent,
    future: [],
  };
};

export const undoable = <State>(options: {
  reducer: Reducer<State>;
  actionTypes: {
    undo: string;
    redo: string;
    snapshot: string;
  };
}) => {
  const {actionTypes, reducer} = options;
  const emptyHistoryState = makeHistory<State>();
  return (
    state = emptyHistoryState,
    action: AnyAction
  ): StateWithHistory<State> => {
    switch (action.type) {
      case actionTypes.undo:
        return undo(state);

      case actionTypes.redo:
        return redo(state);

      case actionTypes.snapshot:
        return updateHistory({
          state,
          reducer,
          action,
        });

      default:
        return state;
    }
  };
};
