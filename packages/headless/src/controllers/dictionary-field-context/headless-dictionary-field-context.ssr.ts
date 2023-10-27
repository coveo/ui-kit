import {CoreEngine} from '../../app/engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  DictionaryFieldContext,
  buildDictionaryFieldContext,
} from './headless-dictionary-field-context';

export * from './headless-dictionary-field-context';

/**
 * @alpha
 */
export const defineDictionaryFieldContext =
  (): ControllerDefinitionWithoutProps<CoreEngine, DictionaryFieldContext> => ({
    build: (engine) => buildDictionaryFieldContext(engine),
  });
