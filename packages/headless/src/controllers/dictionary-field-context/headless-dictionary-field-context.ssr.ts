import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  DictionaryFieldContext,
  buildDictionaryFieldContext,
} from './headless-dictionary-field-context';

export type {
  DictionaryFieldContext,
  DictionaryFieldContextState,
  DictionaryFieldContextPayload,
} from './headless-dictionary-field-context';

/**
 * @internal
 */
export const defineDictionaryFieldContext =
  (): ControllerDefinitionWithoutProps<
    SearchEngine,
    DictionaryFieldContext
  > => ({
    build: (engine) => buildDictionaryFieldContext(engine),
  });
