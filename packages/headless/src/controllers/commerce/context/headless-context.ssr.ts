import {UniversalControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {
  Context,
  buildContext,
  ContextProps,
  ContextOptions,
  View,
} from './headless-context';

export type {ContextState, Context, ContextProps} from './headless-context';
export type {View, ContextOptions};

export interface ContextDefinition
  extends UniversalControllerDefinitionWithoutProps<Context> {}

/**
 * Defines a `Context` controller instance.
 *
 * @returns The `Context` controller definition.
 *
 * @internal
 */
export function defineContext(props: ContextProps = {}): ContextDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    build: (engine) => buildContext(engine, props),
  };
}
