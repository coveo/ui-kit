import {
  addDictionaryFieldContext,
  AddDictionaryFieldContextActionCreatorPayload,
  setDictionaryFieldContext,
} from './dictionary-field-context-actions';
import {dictionaryFieldContextReducer} from './dictionary-field-context-slice';
import {DictionaryFieldContextPayload} from './dictionary-field-context-state';

describe('dictionary field context slice', () => {
  it('initializes state correctly', () => {
    const finalState = dictionaryFieldContextReducer(undefined, {type: ''});
    expect(finalState).toEqual({contextValues: {}});
  });

  describe('#setDictionaryFieldContext', () => {
    it('stores the object in state', () => {
      const payload = {price: 'cad'};
      const action = setDictionaryFieldContext(payload);

      const {contextValues} = dictionaryFieldContextReducer(undefined, action);
      expect(contextValues).toEqual(payload);
    });

    it('when the payload is not an object, the action payload contains an error', () => {
      const payload = setDictionaryFieldContext(
        undefined as unknown as DictionaryFieldContextPayload
      );
      expect('error' in payload).toBe(true);
    });

    it('when a value is not a string, the action payload contains an error', () => {
      const payload = setDictionaryFieldContext({
        a: true,
      } as unknown as DictionaryFieldContextPayload);
      expect('error' in payload).toBe(true);
    });
  });

  describe('#addDictionaryFieldContext', () => {
    it('it adds the field and key to state', () => {
      const action = addDictionaryFieldContext({field: 'price', key: 'cad'});
      const {contextValues} = dictionaryFieldContextReducer(undefined, action);
      expect(contextValues).toEqual({price: 'cad'});
    });

    it('when the payload is not an object, the action payload contains an error', () => {
      const payload = addDictionaryFieldContext(
        undefined as unknown as AddDictionaryFieldContextActionCreatorPayload
      );
      expect('error' in payload).toBe(true);
    });

    it('when the field is not a string, the action payload contains an error', () => {
      const payload = addDictionaryFieldContext({
        field: true as unknown as string,
        key: 'cad',
      });
      expect('error' in payload).toBe(true);
    });
  });
});
