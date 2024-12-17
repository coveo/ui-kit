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
  Parameters, // Recommendations,
} from '@coveo/headless/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';
import {ReactCommerceEngineDefinition} from './commerce-engine.js';

type ControllerPropsMap = {[customName: string]: unknown};
type UnknownAction = {type: string};

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
          case Kind.Cart:
            hydrateArguments[key] = {
              initialState: {
                items: (controllers as Record<string, Cart>)[key].state.items,
              },
            };
            break;

          case Kind.Context:
            hydrateArguments[key] = (controllers as Record<string, Context>)[
              key
            ].state;
            break;

          case Kind.ParameterManager:
            hydrateArguments[key] = {
              initialState: {
                parameters: (
                  controllers as Record<string, ParameterManager<Parameters>>
                )[key].state.parameters,
              },
            };
            break;

          case Kind.Recommendations:
            //KIT-3801: Done here
            break;
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
