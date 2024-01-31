import {CoreEngine} from '../../app/engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  DictionaryFieldContext,
  buildDictionaryFieldContext,
} from './headless-dictionary-field-context';

export * from './headless-dictionary-field-context';

/**
 * Defines a `DictionaryFieldContext` controller instance.
 *
 * @returns The `DictionaryFieldContext` controller definition.
 * */
export function defineDictionaryFieldContext(): ControllerDefinitionWithoutProps<
  CoreEngine,
  DictionaryFieldContext
> {
  return {
    build: (engine) => buildDictionaryFieldContext(engine),
  };
}
