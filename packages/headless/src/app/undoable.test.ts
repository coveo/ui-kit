import {makeHistory, undoable} from './undoable';
import {AnyAction, Reducer} from 'redux';

describe('undoable', () => {
  const reducer: Reducer = (state: string, action: AnyAction) =>
    action.payload ?? state;
  const undo = () => ({type: 'undo'});
  const redo = () => ({type: 'redo'});
  const snapshot = (payload?: string) => ({type: 'snapshot', payload});
  const anyAction = () => ({type: 'random'});

  const setupUndoable = () =>
    undoable({
      reducer,
      actionTypes: {
        redo: redo().type,
        undo: undo().type,
        snapshot: snapshot().type,
      },
    });

  it('returns same state when the action is not snapshot/undo/redo', () => {
    const state = makeHistory();
    const newState = setupUndoable()(state, anyAction());
    expect(newState).toEqual(state);
  });

  describe('support #undo', () => {
    it('returns same state when there is no past history', () => {
      const state = makeHistory('foo');

      const newState = setupUndoable()(state, undo());
      expect(newState).toEqual(state);
    });

    it('returns modified state when there is a past history', () => {
      const state = makeHistory('foo');
      state.past = ['bar'];
      state.future = ['hello', 'world'];

      const newState = setupUndoable()(state, undo());
      expect(newState.future).toEqual(['foo', 'hello', 'world']);
      expect(newState.present).toBe('bar');
      expect(newState.past).toEqual([]);
    });
  });

  describe('support #redo', () => {
    it('returns same state when there is no future history', () => {
      const state = makeHistory('foo');

      const newState = setupUndoable()(state, redo());
      expect(newState).toEqual(state);
    });

    it('returns modified state when there is a future history', () => {
      const state = makeHistory('foo');
      state.past = ['bar'];
      state.future = ['hello', 'world'];

      const newState = setupUndoable()(state, redo());
      expect(newState.future).toEqual(['world']);
      expect(newState.present).toBe('hello');
      expect(newState.past).toEqual(['bar', 'foo']);
    });
  });

  describe('support #snapshot', () => {
    it('creates present on first snapshot', () => {
      const newState = setupUndoable()(makeHistory(), snapshot('first'));
      expect(newState).toEqual(makeHistory('first'));
    });

    it('returns the same state when snapshot is identical', () => {
      const newState = setupUndoable()(makeHistory('first'), snapshot('first'));
      expect(newState).toEqual(makeHistory('first'));
    });

    it('returns updated state when snapshot is different from current state', () => {
      const newState = setupUndoable()(
        makeHistory('first'),
        snapshot('second')
      );
      expect(newState).toEqual({
        past: ['first'],
        present: 'second',
        future: [],
      });
    });
  });
});
