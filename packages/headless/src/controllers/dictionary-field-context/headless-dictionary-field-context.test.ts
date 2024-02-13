import {
  setContext,
  addContext,
  removeContext,
} from '../../features/dictionary-field-context/dictionary-field-context-actions';
import {dictionaryFieldContextReducer as dictionaryFieldContext} from '../../features/dictionary-field-context/dictionary-field-context-slice';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {
  buildDictionaryFieldContext,
  DictionaryFieldContext,
} from './headless-dictionary-field-context';

jest.mock(
  '../../features/dictionary-field-context/dictionary-field-context-actions'
);

describe('Context', () => {
  let context: DictionaryFieldContext;
  let engine: MockedSearchEngine;

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    context = buildDictionaryFieldContext(engine);
  });

  it('initializes properly', () => {
    expect(context.state.values).toEqual({});
  });

  it('it adds the correct reducers to engine', () => {
    dictionaryFieldContext;
    expect(engine.addReducers).toHaveBeenCalledWith({dictionaryFieldContext});
  });

  it('setContext dispatches #setContext', () => {
    context.set({price: 'cad'});
    expect(setContext).toHaveBeenCalledWith({price: 'cad'});
  });

  it('addContext dispatches #addContext', () => {
    context.add('price', 'cad');
    expect(addContext).toHaveBeenCalledWith({key: 'cad', field: 'price'});
  });

  it('removeContext dispatches #removeContext', () => {
    context.remove('price');
    expect(removeContext).toHaveBeenCalledWith('price');
  });
});
