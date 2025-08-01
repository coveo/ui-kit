import {change} from '../history/history-actions.js';
import {
  getHistoryInitialState,
  type HistoryState,
} from '../history/history-state.js';
import {
  type AddDictionaryFieldContextActionCreatorPayload,
  addContext,
  removeContext,
  setContext,
} from './dictionary-field-context-actions.js';
import {dictionaryFieldContextReducer} from './dictionary-field-context-slice.js';
import type {
  DictionaryFieldContextPayload,
  DictionaryFieldContextState,
} from './dictionary-field-context-state.js';

describe('dictionary field context slice', () => {
  it('initializes state correctly', () => {
    const finalState = dictionaryFieldContextReducer(undefined, {type: ''});
    expect(finalState).toEqual({contextValues: {}});
  });

  describe('#setContext', () => {
    it('stores the object in state', () => {
      const payload = {price: 'cad'};
      const action = setContext(payload);

      const {contextValues} = dictionaryFieldContextReducer(undefined, action);
      expect(contextValues).toEqual(payload);
    });

    it('when the payload is not an object, the action contains an error', () => {
      const payload = setContext(
        undefined as unknown as DictionaryFieldContextPayload
      );
      expect('error' in payload).toBe(true);
    });

    it('when a value is not a string, the action contains an error', () => {
      const payload = setContext({
        a: true,
      } as unknown as DictionaryFieldContextPayload);
      expect('error' in payload).toBe(true);
    });
  });

  describe('#addContext', () => {
    it('it adds the field and key to state', () => {
      const action = addContext({field: 'price', key: 'cad'});
      const {contextValues} = dictionaryFieldContextReducer(undefined, action);
      expect(contextValues).toEqual({price: 'cad'});
    });

    it('when the payload is not an object, the action contains an error', () => {
      const payload = addContext(
        undefined as unknown as AddDictionaryFieldContextActionCreatorPayload
      );
      expect('error' in payload).toBe(true);
    });

    it('when the field is not a string, the action contains an error', () => {
      const payload = addContext({
        field: true as unknown as string,
        key: 'cad',
      });
      expect('error' in payload).toBe(true);
    });
  });

  describe('#removeContext', () => {
    it('removes the specified field from state', () => {
      const state: DictionaryFieldContextState = {
        contextValues: {price: 'CAD'},
      };

      const action = removeContext('price');
      const {contextValues} = dictionaryFieldContextReducer(state, action);
      expect(contextValues).toEqual({});
    });

    it('when the field is not a string, the action contains an error', () => {
      const payload = removeContext(true as unknown as string);
      expect('error' in payload).toBe(true);
    });
  });

  it('#change.fulfilled updates the context values', () => {
    const contextValues = {price: 'cad'};

    const state: HistoryState = {
      ...getHistoryInitialState(),
      dictionaryFieldContext: {contextValues},
    };

    const action = change.fulfilled(state, '');
    const finalState = dictionaryFieldContextReducer(undefined, action);

    expect(finalState.contextValues).toEqual(contextValues);
  });
});
