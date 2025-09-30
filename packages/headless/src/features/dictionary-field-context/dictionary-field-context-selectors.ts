import type {DictionaryFieldContextState} from './dictionary-field-context-state.js';

export const selectDictionaryFieldContext = (state: {
  dictionaryFieldContext?: DictionaryFieldContextState;
}) => {
  if (
    !state.dictionaryFieldContext ||
    !Object.keys(state.dictionaryFieldContext.contextValues).length
  ) {
    return undefined;
  }

  return state.dictionaryFieldContext.contextValues;
};
