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
  SolutionType,
  Context,
  HydrateStaticStateOptions,
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

      if ('cart' in controllers) {
        hydrateArguments.cart = {
          initialState: {items: (controllers.cart as Cart).state.items},
        };
      }

      if ('context' in controllers) {
        hydrateArguments.context = (controllers.context as Context).state;
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
