'use client';

import {
  type Cart,
  type Context,
  type Controller,
  type ControllerDefinitionsMap,
  type ControllerWithKind,
  type EngineStaticState,
  type HydrateStaticStateOptions,
  type InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  type InferControllersMapFromDefinition,
  type InferHydratedState,
  Kind,
  type NavigatorContext,
  type ParameterManager,
  type Parameters,
  type Recommendations,
  type SolutionType,
} from '@coveo/headless/ssr-commerce';
import {type PropsWithChildren, useEffect, useState} from 'react';
import type {ReactCommerceEngineDefinition} from './commerce-engine.js';

type ControllerPropsMap = {[customName: string]: unknown};
type UnknownAction = {type: string};

function getController<T extends Controller>(
  controllers: InferControllerStaticStateMapFromDefinitionsWithSolutionType<
    ControllerDefinitionsMap<Controller>,
    SolutionType
  >,
  key: string
) {
  return controllers[key] as T;
}

/**
 * Providers take care of displaying your page with the static
 * state, and then hydrating the state and displaying the page
 * with the hydrated state. They are required for your controller hooks to function.
 *
 * See [Create providers](https://docs.coveo.com/en/obif0156/#create-providers).
 *
 * @group Providers
 */
export function buildProviderWithDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(definition: ReactCommerceEngineDefinition<TControllers, TSolutionType>) {
  return function WrappedProvider({
    staticState,
    navigatorContext,
    children,
  }: PropsWithChildren<{
    staticState: EngineStaticState<
      UnknownAction,
      InferControllerStaticStateMapFromDefinitionsWithSolutionType<
        TControllers,
        TSolutionType
      >
    >;
    /**
     * @deprecated will be removed in the next major release. The navigator context provider can now be set when fetching the static state
     */
    navigatorContext: NavigatorContext;
  }>) {
    const [hydratedState, setHydratedState] = useState<
      InferHydratedState<typeof definition> | undefined
    >(undefined);
    definition.setNavigatorContextProvider(() => navigatorContext);

    useEffect(() => {
      const {searchActions, controllers} = staticState;
      const hydrateArguments: ControllerPropsMap = {};

      for (const [key, controller] of Object.entries(controllers)) {
        const typedController = controller as ControllerWithKind;

        // TODO: KIT-4742: remove state wiring as it is already done in headless
        switch (typedController._kind) {
          case Kind.Cart: {
            const cart = getController<Cart>(controllers, key);
            hydrateArguments[key] = {
              initialState: {
                items: cart.state.items,
              },
            };
            break;
          }
          case Kind.Context: {
            const context = getController<Context>(controllers, key);
            hydrateArguments[key] = context.state;
            break;
          }

          case Kind.ParameterManager: {
            const parameterManager = getController<
              ParameterManager<Parameters>
            >(controllers, key);
            hydrateArguments[key] = {
              initialState: {
                parameters: parameterManager.state.parameters,
              },
            };
            break;
          }
          case Kind.Recommendations: {
            const recommendations = getController<Recommendations>(
              controllers,
              key
            );

            hydrateArguments[key] = {
              productId: recommendations.state.productId,
            };
            break;
          }
        }
      }

      const args: HydrateStaticStateOptions<UnknownAction> &
        ControllerPropsMap = {
        searchActions,
      };

      if (hydrateArguments) {
        args.controllers = hydrateArguments;
      }

      // @ts-expect-error Casting to loose definition since we don't need the inferred controllers here
      const looseDefinition = definition as ReactCommerceEngineDefinition<
        ControllerDefinitionsMap<Controller>,
        SolutionType
      >;
      looseDefinition.hydrateStaticState(args).then(({engine, controllers}) => {
        setHydratedState({
          engine,
          controllers: controllers as InferControllersMapFromDefinition<
            TControllers,
            TSolutionType
          >,
        });
      });
    }, [staticState, definition]);

    return (
      <definition.StateProvider
        engine={hydratedState?.engine}
        controllers={hydratedState?.controllers || staticState.controllers}
      >
        {children}
      </definition.StateProvider>
    );
  };
}
