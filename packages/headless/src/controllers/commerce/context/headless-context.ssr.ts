import type {UniversalControllerDefinitionWithProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  createControllerWithKind,
  Kind,
} from '../../../app/commerce-ssr-engine/types/kind.js';
import {MissingControllerProps} from '../../../utils/errors.js';
import {
  buildContext,
  type Context,
  type ContextOptions,
  type UserLocation,
  type View,
} from './headless-context.js';

export type {Context, ContextProps, ContextState} from './headless-context.js';
export type {View, UserLocation, ContextOptions};

export interface ContextDefinition
  extends UniversalControllerDefinitionWithProps<Context, ContextOptions> {}

/**
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
