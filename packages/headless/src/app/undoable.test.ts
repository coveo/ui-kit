import type {AnyAction, Reducer} from '@reduxjs/toolkit';
import {makeHistory, undoable} from './undoable.js';

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

    it('supports a maximum of 10 past history entries', () => {
      const mockUndoableReducer = undoable({
        reducer,
        actionTypes: {
          redo: redo().type,
          undo: undo().type,
          snapshot: snapshot().type,
        },
      });
      const initialOverflow = 50;

      const initialState = {
        past: Array.from(
          {length: initialOverflow},
          (_, i) => `entry-overflow-${i}`
        ),
        present: 'present-before-snapshot',
        future: [],
      };
      const newState = mockUndoableReducer(
        initialState,
        snapshot('present-after-snapshot')
      );
      expect(newState.past.length).toBe(10);
      expect(newState.past[newState.past.length - 1]).toBe(
        'present-before-snapshot'
      );
      expect(newState.past[0]).toBe(`entry-overflow-${initialOverflow - 9}`);
      expect(newState.present).toBe('present-after-snapshot');
    });
  });
});
