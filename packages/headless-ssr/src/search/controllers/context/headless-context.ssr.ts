import type {SearchEngine} from '@coveo/headless';
import {buildContext, type Context} from '@coveo/headless';
import type {ContextProps} from '@coveo/headless';
import {MissingControllerProps} from '../../../common/errors.js';
import type {ControllerDefinitionWithProps} from '../../types/controller-definition.js';

export {
  type Context,
  type ContextInitialState,
  type ContextPayload,
  type ContextProps,
  type ContextState,
  type ContextValue,
} from '@coveo/headless';

export interface ContextDefinition extends ControllerDefinitionWithProps<
  SearchEngine,
  Context,
  ContextProps
> {}

/**
 * Defines a `Context` controller instance.
 * @group Definers
 *
 * @returns The `Context` controller definition.
 * */
export function defineContext(): ContextDefinition {
  return {
    // TODO: KIT-5154 - Apply commerce pattern
    buildWithProps: (engine, props) => {
      if (props === undefined) {
        throw new MissingControllerProps('Context');
      }
      return buildContext(engine, {initialState: props.initialState});
    },
  };
}
