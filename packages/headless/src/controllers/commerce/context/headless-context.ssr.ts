import {UniversalControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  Context,
  buildContext,
  ContextProps,
  ContextOptions,
  View,
  UserLocation,
} from './headless-context.js';

export type {ContextState, Context, ContextProps} from './headless-context.js';
export type {View, UserLocation, ContextOptions};

export interface ContextDefinition
  extends UniversalControllerDefinitionWithoutProps<Context> {}

/**
 * Defines a `Context` controller instance.
 * @group Definers
 *
 * @returns The `Context` controller definition.
 *
 */
export function defineContext(props: ContextProps = {}): ContextDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    build: (engine) => buildContext(engine, props),
  };
}
