import {Reducer, AnyAction} from 'redux';
import {createAction} from '@reduxjs/toolkit';

const ActionTypes = {
  UNDO: '@@undoable/UNDO',
  REDO: '@@undoable/REDO',
};

export const makeHistory = <State>(state: State): StateWithHistory<State> => ({
  past: [],
  present: state,
  future: [],
});

export interface StateWithHistory<State> {
  past: State[];
  present: State;
  future: State[];
}

export const ActionCreators = {
  undo: () => createAction(ActionTypes.UNDO),
  redo: () => createAction(ActionTypes.REDO),
};

const undo = <State>(state: StateWithHistory<State>) => {
  const {past, present, future} = state;

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

const redo = <State>(state: StateWithHistory<State>) => {
  const {past, present, future} = state;

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

const updateHistory = <State, Action extends AnyAction>(
  state: StateWithHistory<State>,
  emptyState: StateWithHistory<State>,
  reducer: Reducer<State>,
  action: Action
) => {
  const {past, present} = state;
  const newPresent = reducer(present, action);

  if (newPresent === emptyState.present || present === newPresent) {
    return state;
  }

  // Small special twist on the documented/standard redux undo recipe
  // We want to make the "actual first valid initial state" the first one that ends up being different from the "empty state" passed into undoable
  // This allows for slices to register themselves dynamically (Concrete example: facet-slice).
  if (present === emptyState.present) {
    return makeHistory(newPresent);
  }

  return {
    past: [...past, present],
    present: newPresent,
    future: [],
  };
};

export const undoable = <State, Action extends AnyAction>(
  reducer: Reducer<State>,
  emptyState: State
) => {
  const emptyStateWithHistory = makeHistory(emptyState);

  return (state = emptyStateWithHistory, action: Action) => {
    switch (action.type) {
      case ActionTypes.UNDO:
        return undo(state);

      case ActionTypes.REDO:
        return redo(state);

      default:
        return updateHistory(state, emptyStateWithHistory, reducer, action);
    }
  };
};
