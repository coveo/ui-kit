import {
  setContext,
  addContext,
  removeContext,
} from '../../features/dictionary-field-context/dictionary-field-context-actions.js';
import {dictionaryFieldContextReducer as dictionaryFieldContext} from '../../features/dictionary-field-context/dictionary-field-context-slice.js';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine.js';
import {
  buildDictionaryFieldContext,
  DictionaryFieldContext,
} from './headless-dictionary-field-context.js';

describe('Context', () => {
  let context: DictionaryFieldContext;
  let engine: MockSearchEngine;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
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
    const found = engine.actions.find((a) => a.type === setContext.type);

    expect(engine.actions).toContainEqual(found);
  });

  it('addContext dispatches #addContext', () => {
    context.add('price', 'cad');
    const found = engine.actions.find((a) => a.type === addContext.type);

    expect(engine.actions).toContainEqual(found);
  });

  it('removeContext dispatches #removeContext', () => {
    context.remove('price');
    const found = engine.actions.find((a) => a.type === removeContext.type);

    expect(engine.actions).toContainEqual(found);
  });
});
