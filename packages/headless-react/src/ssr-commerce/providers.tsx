'use client';

import {
  CommerceEngine,
  Controller,
  ControllerDefinitionsMap,
  InferControllersMapFromDefinition,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferHydratedState,
  InferStaticState,
  NavigatorContext,
  NavigatorContextProvider,
  SolutionType,
} from '@coveo/headless/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';
import {SSRCommerceEngine} from '../../../headless/dist/definitions/app/commerce-ssr-engine/factories/build-factory.js';
import {defineCommerceEngine} from './commerce-engine.js';

// interface RecommendationProviderProps {
//   recommendationEngineDefinition: ReturnType<
//     typeof defineCommerceEngine
//   >['recommendationEngineDefinition'];
//   staticState: InferStaticState<
//     ReturnType<typeof defineCommerceEngine>['recommendationEngineDefinition']
//   >;
//   navigatorContext: NavigatorContext;
// }

// function RecommendationProvider({
//   recommendationEngineDefinition,
//   staticState,
//   navigatorContext,
//   children,
// }: PropsWithChildren<RecommendationProviderProps>) {
//   type RecommendationHydratedState = InferHydratedState<
//     typeof recommendationEngineDefinition
//   >;
//   const [hydratedState, setHydratedState] = useState<
//     RecommendationHydratedState | undefined
//   >(undefined);

//   recommendationEngineDefinition.setNavigatorContextProvider(
//     () => navigatorContext
//   );

//   useEffect(() => {
//     recommendationEngineDefinition
//       .hydrateStaticState({
//         searchActions: staticState.searchActions,
//       })
//       .then(({engine, controllers}) => {
//         setHydratedState({engine, controllers});
//       });
//   }, [staticState]);

//   if (hydratedState) {
//     return (
//       <recommendationEngineDefinition.HydratedStateProvider
//         engine={hydratedState.engine}
//         controllers={hydratedState.controllers}
//       >
//         {children}
//       </recommendationEngineDefinition.HydratedStateProvider>
//     );
//   } else {
//     return (
//       <recommendationEngineDefinition.StaticStateProvider
//         controllers={staticState.controllers}
//       >
//         {children}
//       </recommendationEngineDefinition.StaticStateProvider>
//     );
//   }
// }

// interface WithRecommendationProps {
//   staticState: InferStaticState<
//     ReturnType<typeof defineCommerceEngine>['recommendationEngineDefinition']
//   >;
//   navigatorContext: NavigatorContext;
// }

// interface WithListingProps {
//   staticState: InferStaticState<
//     ReturnType<typeof defineCommerceEngine>['listingEngineDefinition']
//   >;
//   navigatorContext: NavigatorContext;
// }

// export function ProviderWithRecommendation(
//   recommendationEngineDefinition: unknown
// ) {
//   return function WrappedRecommendationProvider({
//     staticState,
//     navigatorContext,
//     children,
//   }: PropsWithChildren<WithRecommendationProps>) {
//     const castedDefinition = recommendationEngineDefinition as ReturnType<
//       typeof defineCommerceEngine
//     >['recommendationEngineDefinition'];

//     return (
//       <RecommendationProvider
//         recommendationEngineDefinition={castedDefinition}
//         staticState={staticState}
//         navigatorContext={navigatorContext}
//       >
//         {children}
//       </RecommendationProvider>
//     );
//   };
// }

// interface ListingProviderProps {
//   listingEngineDefinition: unknown;
//   staticState: InferStaticState<
//     ReturnType<typeof defineCommerceEngine>['listingEngineDefinition']
//   >;
//   navigatorContext: NavigatorContext;
// }

// function ListingProvider({
//   listingEngineDefinition,
//   staticState,
//   navigatorContext,
//   children,
// }: PropsWithChildren<ListingProviderProps>) {
//   const definition = listingEngineDefinition as good;

//   type good = ReturnType<
//     typeof defineCommerceEngine
//   >['listingEngineDefinition'];

//   type RecommendationHydratedState = InferHydratedState<typeof definition>;
//   const [hydratedState, setHydratedState] = useState<
//     RecommendationHydratedState | undefined
//   >(undefined);

//   definition.setNavigatorContextProvider(() => navigatorContext);

//   useEffect(() => {
//     definition
//       .hydrateStaticState({
//         searchActions: staticState.searchActions,
//         controllers: staticState.controllers,
//       })
//       .then(({engine, controllers}) => {
//         setHydratedState({engine, controllers});
//       });
//   }, [staticState]);

//   if (hydratedState) {
//     return (
//       <definition.HydratedStateProvider
//         engine={hydratedState.engine}
//         controllers={hydratedState.controllers}
//       >
//         {children}
//       </definition.HydratedStateProvider>
//     );
//   } else {
//     return (
//       <definition.StaticStateProvider controllers={staticState.controllers}>
//         {children}
//       </definition.StaticStateProvider>
//     );
//   }
// }

// export function ProviderWithListing(listingEngineDefinition: unknown) {
//   return function WrappedRecommendationProvider({
//     staticState,
//     navigatorContext,
//     children,
//   }: PropsWithChildren<WithListingProps>) {
//     return (
//       <ListingProvider
//         listingEngineDefinition={listingEngineDefinition}
//         staticState={staticState}
//         navigatorContext={navigatorContext}
//       >
//         {children}
//       </ListingProvider>
//     );
//   };
// }

// interface ProviderProps {
//   definition: GenericDefinition;
//   staticState: GenericStaticState;
//   navigatorContext: NavigatorContext;
// }

// function Provider({
//   definition,
//   staticState,
//   navigatorContext,
//   children,
// }: PropsWithChildren<ProviderProps>) {
//   type RecommendationHydratedState = InferHydratedState<typeof definition>;
//   const [hydratedState, setHydratedState] = useState<
//     RecommendationHydratedState | undefined
//   >(undefined);

//   definition.setNavigatorContextProvider(() => navigatorContext);

//   useEffect(() => {
//     definition
//       .hydrateStaticState({
//         searchActions: staticState.searchActions,

//         controllers: staticState.controllers,
//       })
//       .then(({engine, controllers}) => {
//         setHydratedState({engine, controllers});
//       });
//   }, [staticState]);

//   if (hydratedState) {
//     return (
//       <definition.HydratedStateProvider
//         engine={hydratedState.engine}
//         controllers={hydratedState.controllers}
//       >
//         {children}
//       </definition.HydratedStateProvider>
//     );
//   } else {
//     return (
//       <definition.StaticStateProvider controllers={staticState.controllers}>
//         {children}
//       </definition.StaticStateProvider>
//     );
//   }
// }

interface WithDefinitionProps<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> {
  staticState: InferStaticState<GenericDefinition<TControllers, TSolutionType>>;
  navigatorContext: NavigatorContext;
}

type GenericDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  StaticStateProvider: (
    props: PropsWithChildren<{
      controllers: InferControllerStaticStateMapFromDefinitionsWithSolutionType<
        TControllers,
        TSolutionType
      >;
    }>
  ) => JSX.Element;

  HydratedStateProvider: (
    props: PropsWithChildren<{
      engine: CommerceEngine;
      controllers: InferControllersMapFromDefinition<
        TControllers,
        TSolutionType
      >;
    }>
  ) => JSX.Element;
  setNavigatorContextProvider: (
    navigatorContextProvider: NavigatorContextProvider
  ) => void;
  hydrateStaticState: (args: {
    controllers: TControllers;
    searchActions: unknown;
  }) => Promise<{engine: SSRCommerceEngine; controllers: TControllers}>;
};
// Repeat for other definitions

/**
 * TODO MONDAY WHAT I NEED TO DO HERE IS ADD A GENERIC THAT TAKES IN THE CONTROLLER AND MAKE IT AFFECT THE STATICSTATEPROVIDER TYPE OF THE DEFINITION TYPE
 */
export function buildProviderWithDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(definition: GenericDefinition<TControllers, TSolutionType>) {
  return function WrappedProvider({
    staticState,
    navigatorContext,
    children,
  }: PropsWithChildren<WithDefinitionProps>) {
    type RecommendationHydratedState = InferHydratedState<typeof definition>;
    const [hydratedState, setHydratedState] = useState<
      RecommendationHydratedState | undefined
    >(undefined);

    // Set navigator context provider
    useEffect(() => {
      definition.setNavigatorContextProvider(() => navigatorContext);
    }, [navigatorContext]);

    // Hydrate static state
    useEffect(() => {
      definition
        .hydrateStaticState({
          searchActions: staticState.searchActions,
          controllers: staticState.controllers,
        })
        .then(({engine, controllers}) => {
          setHydratedState({engine, controllers});
        });
    }, [staticState]);

    // Render based on hydrated state
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

    return (
      <definition.StaticStateProvider controllers={staticState.controllers}>
        {children}
      </definition.StaticStateProvider>
    );
  };
}
