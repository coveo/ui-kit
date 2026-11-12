import {
  buildContext,
  type Context,
  type ContextOptions,
  type ContextProps,
  type ContextState,
  type CustomContext,
  type UserLocation,
  type View,
} from '../../../../controllers/commerce/context/headless-context.js';
import type {UniversalControllerDefinition} from '../../types/controller-definitions.js';

export type {
  Context,
  ContextOptions,
  ContextProps,
  ContextState,
  CustomContext,
  UserLocation,
  View,
};

export type ContextDefinition = UniversalControllerDefinition<Context>;

/**
 * Defines a `Context` controller instance.
 * @group Definers
 *
 * @returns The `Context` controller definition.
 *
 * Note: This controller is included in every engine definition and fed by the `context` option of `fetchStaticState()`.
 */
export function defineContext(): ContextDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    // The view URL is resolved by `withDefaultViewUrl()` before the controllers are built.
    build: (engine, {buildConfig}) =>
      buildContext(engine, {options: buildConfig.context as ContextOptions}),
  };
}
