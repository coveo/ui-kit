import {CoreEngine} from '../../app/engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  DictionaryFieldContext,
  buildDictionaryFieldContext,
} from './headless-dictionary-field-context';

export * from './headless-dictionary-field-context';

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
