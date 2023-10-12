import {CoreEngine} from '../../app/engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  DictionaryFieldContext,
  buildDictionaryFieldContext,
} from './headless-dictionary-field-context.js';

export * from './headless-dictionary-field-context.js';

/**
 * @internal
 */
export const defineDictionaryFieldContext =
  (): ControllerDefinitionWithoutProps<CoreEngine, DictionaryFieldContext> => ({
    build: (engine) => buildDictionaryFieldContext(engine),
  });
