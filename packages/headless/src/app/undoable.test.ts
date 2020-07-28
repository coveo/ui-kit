import {makeHistory, undoable, ActionCreators} from './undoable';
import {Reducer} from 'redux';

describe('undoable', () => {
  const noopReducer: Reducer = <S>(s: S) => s;
  const anyAction = () => ({type: 'random'});
  const addUnderscoreReducer: Reducer = <S>(s: S) => s + '_';

  describe('support #undo', () => {
    it('returns same state when there is no past history', () => {
      const state = makeHistory('foo');

      const testUndoable = undoable(noopReducer, '');
      const newState = testUndoable(state, ActionCreators.undo());
      expect(newState).toEqual(state);
    });

    it('returns modified state when there is a past history', () => {
      const state = makeHistory('foo');
      state.past = ['bar'];
      state.future = ['hello', 'world'];

      const testUndoable = undoable(noopReducer, '');
      const newState = testUndoable(state, ActionCreators.undo());
      expect(newState.future).toEqual(['foo', 'hello', 'world']);
      expect(newState.present).toBe('bar');
      expect(newState.past).toEqual([]);
    });
  });

  describe('support #redo', () => {
    it('returns same state when there is no future history', () => {
      const state = makeHistory('foo');

      const testUndoable = undoable(noopReducer, '');
      const newState = testUndoable(state, ActionCreators.redo());
      expect(newState).toEqual(state);
    });

    it('returns modified state when there is a future history', () => {
      const state = makeHistory('foo');
      state.past = ['bar'];
      state.future = ['hello', 'world'];

      const testUndoable = undoable(noopReducer, '');
      const newState = testUndoable(state, ActionCreators.redo());
      expect(newState.future).toEqual(['world']);
      expect(newState.present).toBe('hello');
      expect(newState.past).toEqual(['bar', 'foo']);
    });
  });

  describe('support #updateHistory on default action', () => {
    it('returns same state when the reducer returns same state', () => {
      const state = makeHistory('foo');

      const testUndoable = undoable(noopReducer, '');
      const newState = testUndoable(state, anyAction());
      expect(newState).toEqual(state);
    });

    it('returns same state when the reducer returns empty state', () => {
      const state = makeHistory('');

      const testUndoable = undoable(addUnderscoreReducer, '_');
      const newState = testUndoable(state, anyAction());
      expect(newState).toEqual(state);
    });

    it('returns initial state when the reducer does not returns empty state', () => {
      const state = makeHistory('');

      const testUndoable = undoable(addUnderscoreReducer, '');
      const newState = testUndoable(state, anyAction());
      expect(newState.present).toBe('_');
      expect(newState.future).toEqual([]);
      expect(newState.past).toEqual([]);
    });

    it('returns updated state after the reducer has not returned empty state', () => {
      const state = makeHistory('');

      const testUndoable = undoable(addUnderscoreReducer, '');
      const firstState = testUndoable(state, anyAction());
      const secondState = testUndoable(firstState, anyAction());
      const thirdState = testUndoable(secondState, anyAction());

      expect(thirdState.present).toBe('___');
      expect(thirdState.future).toEqual([]);
      expect(thirdState.past).toEqual(['_', '__']);
    });
  });
});
