import type {CoreEngine} from '../../../../app/engine.js';
import {
  buildDictionaryFieldContext,
  type DictionaryFieldContext,
} from '../../../../controllers/dictionary-field-context/headless-dictionary-field-context.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export * from '../../../../controllers/dictionary-field-context/headless-dictionary-field-context.js';

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
