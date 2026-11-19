import type {CoreEngine} from '@coveo/headless';
import {buildDictionaryFieldContext, type DictionaryFieldContext} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type DictionaryFieldContextPayload,
  type DictionaryFieldContext,
  type DictionaryFieldContextState,
} from '@coveo/headless';

export interface DictionaryFieldContextDefinition extends ControllerDefinitionWithoutProps<
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
