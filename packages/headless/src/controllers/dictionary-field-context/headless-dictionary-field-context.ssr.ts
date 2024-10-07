import {CoreEngine} from '../../app/engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  DictionaryFieldContext,
  buildDictionaryFieldContext,
} from './headless-dictionary-field-context.js';

export * from './headless-dictionary-field-context.js';

export interface DictionaryFieldContextDefinition
  extends ControllerDefinitionWithoutProps<
    CoreEngine,
    DictionaryFieldContext
  > {}

/**
 * Defines a `DictionaryFieldContext` controller instance.
 *
 * @returns The `DictionaryFieldContext` controller definition.
 * */
export function defineDictionaryFieldContext(): DictionaryFieldContextDefinition {
  return {
    build: (engine) => buildDictionaryFieldContext(engine),
  };
}
