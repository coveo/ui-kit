import {
  buildContext,
  type Context,
  type ContextOptions,
  type ContextProps,
  type ContextState,
  type UserLocation,
  type View,
} from '../../../../controllers/commerce/context/headless-context.js';
import {MissingControllerProps} from '../../../common/errors.js';
import type {UniversalControllerDefinitionWithProps} from '../../types/controller-definitions.js';

export type {
  Context,
  ContextProps,
  ContextState,
  View,
  UserLocation,
  ContextOptions,
};

export type ContextDefinition = UniversalControllerDefinitionWithProps<
  Context,
  {initialState: ContextOptions}
>;

/**
 * Defines a `Context` controller instance.
 * @group Definers
 *
 * @returns The `Context` controller definition.
 *
 * Note: This controller is automatically included in all engine definitions. You do not need to add it manually to your engine definition configuration.
 */
export function defineContext(): ContextDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    recommendation: true,
    buildWithProps: (engine, props: {initialState: ContextOptions}) => {
      if (props === undefined) {
        throw new MissingControllerProps('Context');
      }
      return buildContext(engine, {options: props.initialState});
    },
  };
}
