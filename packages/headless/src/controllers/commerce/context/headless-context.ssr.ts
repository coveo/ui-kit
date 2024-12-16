import {UniversalControllerDefinitionWithProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {Kind} from '../../../app/commerce-ssr-engine/types/kind.js';
import {ControllerWithKind} from '../../../app/ssr-engine/types/common.js';
import {
  Context,
  buildContext,
  ContextOptions,
  View,
  UserLocation,
} from './headless-context.js';

export type {ContextState, Context, ContextProps} from './headless-context.js';
export type {View, UserLocation, ContextOptions};

interface InternalContext extends Context, ControllerWithKind {
  _kind: Kind.Context;
  state: Context['state'];
}

export interface ContextDefinition
  extends UniversalControllerDefinitionWithProps<
    InternalContext,
    ContextOptions
  > {}

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
      return {
        ...buildContext(engine, {options: props}),
        _kind: Kind.Context,
      };
    },
  };
}
