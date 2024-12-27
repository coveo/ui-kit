'use client';

import {
  Cart,
  Controller,
  InferControllersMapFromDefinition,
  ControllerDefinitionsMap,
  EngineStaticState,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferHydratedState,
  NavigatorContext,
  ControllerWithKind,
  Kind,
  SolutionType,
  Context,
  HydrateStaticStateOptions,
  ParameterManager,
  Parameters,
  Recommendations,
} from '@coveo/headless/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';
import {ReactCommerceEngineDefinition} from './commerce-engine.js';

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
    }, [staticState]);

    if (hydratedState) {
      return (
        <definition.HydratedStateProvider
          engine={hydratedState.engine}
          controllers={hydratedState.controllers}
        >
          {children}
        </definition.HydratedStateProvider>
      );
    }

    const StaticStateProviderWithAnyControllers =
      definition.StaticStateProvider as React.ComponentType<{
        controllers: InferControllerStaticStateMapFromDefinitionsWithSolutionType<
          ControllerDefinitionsMap<Controller>,
          SolutionType
        >;
        children: React.ReactNode;
      }>;

    return (
      <StaticStateProviderWithAnyControllers
        controllers={staticState.controllers}
      >
        {children}
      </StaticStateProviderWithAnyControllers>
    );
  };
}
