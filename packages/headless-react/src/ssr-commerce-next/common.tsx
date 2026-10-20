import {
  type Controller,
  type ControllerDefinitionsMap,
  type InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  type InferControllersMapFromDefinition,
  SolutionType,
  type CommerceEngine as SSRCommerceEngine,
} from '@coveo/headless/ssr-commerce-next';
import type {Context, FunctionComponent, PropsWithChildren} from 'react';
import {
  buildControllerHooks as buildSharedControllerHooks,
  buildEngineHook as buildSharedEngineHook,
  buildHydrationHook as buildSharedHydrationHook,
  buildStateProvider as buildSharedStateProvider,
  type EngineContext,
} from '../ssr-common/hooks.js';
import type {SingletonGetter} from '../utils.js';
import type {ContextState, InferControllerHooksMapFromDefinition} from './types.js';

type CommerceContext<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = SingletonGetter<Context<ContextState<TControllers, TSolutionType> | null>>;

const supportedSolutionTypes = (definition: object) =>
  Object.values(SolutionType).filter(
    (solutionType) => (definition as Record<string, unknown>)[solutionType] === true
  );

export function buildControllerHooks<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(singletonContext: CommerceContext<TControllers, TSolutionType>, controllersMap?: TControllers) {
  return buildSharedControllerHooks(
    singletonContext as unknown as EngineContext,
    controllersMap,
    supportedSolutionTypes
  ) as InferControllerHooksMapFromDefinition<TControllers>;
}

export function buildEngineHook<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(singletonContext: CommerceContext<TControllers, TSolutionType>) {
  return buildSharedEngineHook(singletonContext as unknown as EngineContext) as () =>
    | SSRCommerceEngine
    | undefined;
}

export function buildHydrationHook<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(singletonContext: CommerceContext<TControllers, TSolutionType>) {
  return buildSharedHydrationHook(singletonContext as unknown as EngineContext);
}

export function buildStateProvider<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(singletonContext: CommerceContext<TControllers, TSolutionType>, solutionType: TSolutionType) {
  return buildSharedStateProvider(
    singletonContext as unknown as EngineContext,
    solutionType
  ) as FunctionComponent<
    PropsWithChildren<{
      engine?: SSRCommerceEngine;
      controllers:
        | InferControllersMapFromDefinition<TControllers, TSolutionType>
        | InferControllerStaticStateMapFromDefinitionsWithSolutionType<TControllers, TSolutionType>;
      hydrationError?: unknown;
    }>
  >;
}
