import {
  type ContextProps as BaseContextProps,
  buildContext,
  type Context,
  type ContextOptions,
  type ContextState,
  type UserLocation,
  type View,
} from '../../../../controllers/commerce/context/headless-context.js';
import {MissingControllerProps} from '../../../common/errors.js';
import type {SSRCommerceEngine} from '../../factories/build-factory.js';
import type {
  ControllerWithKind,
  UniversalControllerDefinitionWithProps,
} from '../../types/controller-definitions.js';
import {createControllerWithKind, Kind} from '../../types/kind.js';

interface DeprecatedContextOption extends ContextOptions {
  /**
   * @deprecated This property will be removed in the next major release.
   * Use `initialState.language` instead for consistency with other controllers.
   *
   * @example
   * ```ts
   * // Current (deprecated):
   * { language: 'fr'}
   *
   * // Future
   * { initialState: { language: 'fr'} }
   * ```
   */
  language: never;
  /**
   * @deprecated This property will be removed in the next major release.
   * Use `initialState.country` instead for consistency with other controllers.
   *
   * @example
   * ```ts
   * // Current (deprecated):
   * { country: 'CA'}
   *
   * // Future
   * { initialState: { country: 'CA'} }
   * ```
   */
  country: never;
  /**
   * @deprecated This property will be removed in the next major release.
   * Use `initialState.currency` instead for consistency with other controllers.
   *
   * @example
   * ```ts
   * // Current (deprecated):
   * { currency: 'CAD'}
   *
   * // Future
   * { initialState: { currency: 'CAD'} }
   * ```
   */
  currency: never;
  /**
   * @deprecated This property will be removed in the next major release.
   * Use `initialState.view` instead for consistency with other controllers.
   *
   * @example
   * ```ts
   * // Current (deprecated):
   * { view: '{}'}
   *
   * // Future
   * { initialState: { view: '{}'} }
   * ```
   */
  view: never;
  /**
   * @deprecated This property will be removed in the next major release.
   * Use `initialState.location` instead for consistency with other controllers.
   *
   * @example
   * ```ts
   * // Current (deprecated):
   * { location: '...'}
   *
   * // Future
   * { initialState: { location: '...'} }
   * ```
   */
  location?: never;
}

interface ContextDefinitionProps {
  /**
   * The initial state for the context controller.
   * This is the recommended way to pass context options.
   */
  initialState: ContextOptions;
}

type ContextDefinitionOptions =
  | DeprecatedContextOption
  | ContextDefinitionProps;

export type {
  Context,
  BaseContextProps as ContextProps,
  ContextState,
  View,
  UserLocation,
  ContextOptions,
};

export interface ContextDefinition
  extends UniversalControllerDefinitionWithProps<
    Context,
    ContextDefinitionOptions
  > {
  buildWithProps: (
    engine: SSRCommerceEngine,
    props: ContextDefinitionOptions
  ) => Context & ControllerWithKind;
}

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

      // Handle backward compatibility
      const contextOptions: ContextOptions =
        'initialState' in props ? props.initialState : props;

      const controller = buildContext(engine, {options: contextOptions});
      return createControllerWithKind(controller, Kind.Context);
    },
  };
}
