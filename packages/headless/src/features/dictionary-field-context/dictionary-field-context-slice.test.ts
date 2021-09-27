import {dictionaryFieldContextReducer} from './dictionary-field-context-slice';

describe('dictionary field context slice', () => {
  it('initializes state correctly', () => {
    const finalState = dictionaryFieldContextReducer(undefined, {type: ''});
    expect(finalState).toEqual({contextValues: {}});
  });
});
