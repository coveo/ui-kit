import {UniversalControllerDefinitionWithProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {Kind} from '../../../app/commerce-ssr-engine/types/kind.js';
import {MissingControllerProps} from '../../../utils/errors.js';
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
      if (props === undefined) {
        throw new MissingControllerProps('Context');
      }
      return {
        ...buildContext(engine, {options: props}),
        _kind: Kind.Context,
      };
    },
  };
}
