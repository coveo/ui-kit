import type {CoreEngine} from '../../app/engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  buildDictionaryFieldContext,
  type DictionaryFieldContext,
} from './headless-dictionary-field-context.js';

export * from './headless-dictionary-field-context.js';

export interface DictionaryFieldContextDefinition
  extends ControllerDefinitionWithoutProps<
    CoreEngine,
    DictionaryFieldContext
  > {}

/**
 * Defines a `DictionaryFieldContext` controller instance.
 * @group Definers
 *
 * @returns The `DictionaryFieldContext` controller definition.
 * */
export function defineDictionaryFieldContext(): DictionaryFieldContextDefinition {
  return {
    build: (engine) => buildDictionaryFieldContext(engine),
  };
}
