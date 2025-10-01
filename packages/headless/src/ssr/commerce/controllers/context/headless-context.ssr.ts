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
import {createControllerWithKind, Kind} from '../../types/kind.js';

export type {
  Context,
  ContextProps,
  ContextState,
  View,
  UserLocation,
  ContextOptions,
};

export interface ContextDefinition
  extends UniversalControllerDefinitionWithProps<Context, ContextOptions> {}

/**
 * @deprecated In the future, the context controller will be included by default in the engine definition. You will no longer need to define it manually
 * Defines a `Context` controller instance.
 * @group Definers
 *
 * @returns The `Context` controller definition.
 */
export function defineContext(): ContextDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    recommendation: true,
    buildWithProps: (engine, props) => {
      if (props === undefined) {
        throw new MissingControllerProps(Kind.Context);
      }
      const controller = buildContext(engine, {options: props});
      return createControllerWithKind(controller, Kind.Context);
    },
  };
}
