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

export type ContextDefinition = UniversalControllerDefinitionWithProps<
  Context,
  {initialState: ContextOptions}
>;

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
    buildWithProps: (engine, props: {initialState: ContextOptions}) => {
      if (props === undefined) {
        throw new MissingControllerProps(Kind.Context);
      }
      const controller = buildContext(engine, {options: props.initialState});
      return createControllerWithKind(controller, Kind.Context);
    },
  };
}
