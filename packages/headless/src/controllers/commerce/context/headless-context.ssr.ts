import {UniversalControllerDefinitionWithProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  createControllerWithKind,
  Kind,
} from '../../../app/commerce-ssr-engine/types/kind.js';
import {
  Context,
  buildContext,
  ContextOptions,
  View,
  UserLocation,
} from './headless-context.js';

export type {ContextState, Context, ContextProps} from './headless-context.js';
export type {View, UserLocation, ContextOptions};

export interface ContextDefinition
  extends UniversalControllerDefinitionWithProps<Context, ContextOptions> {}

/**
 * Defines a `Context` controller instance.
 * @group Definers
 *
 * @returns The `Context` controller definition.
 *
 * @internal
 */
export function defineContext(): ContextDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    recommendation: true,
    buildWithProps: (engine, props) => {
      const controller = buildContext(engine, {options: props});
      return createControllerWithKind(controller, Kind.Cart);
    },
  };
}
