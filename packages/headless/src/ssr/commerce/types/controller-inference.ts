import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {HasKey, HasKeys} from '../../common/types/utilities.js';
import type {
  recommendationInternalOptionKey,
  SolutionType,
} from './controller-constants.js';
import type {
  ControllerDefinition,
  ControllerDefinitionsMap,
  ControllerDefinitionWithoutProps,
  ControllerDefinitionWithProps,
  InferControllerStaticStateFromController,
  RecommendationControllerSettings,
} from './controller-definitions.js';

export type InferStaticState<
  T extends {
    fetchStaticState(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['fetchStaticState']>>;

export type InferHydratedState<
  T extends {
    hydrateStaticState(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['hydrateStaticState']>>;

/**
 * @deprecated This type is deprecated and will be removed in a future version.
 * {@link EngineDefinition.build} will be removed in a future version.
 */
export type InferBuildResult<
  T extends {
    build(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['build']>>;

export type InferControllerPropsFromDefinition<
  TController extends ControllerDefinition<Controller>,
> = TController extends ControllerDefinitionWithProps<Controller, infer Props>
  ? HasKey<TController, typeof recommendationInternalOptionKey> extends never
    ? Props
    : Props & RecommendationControllerSettings
  : TController extends ControllerDefinitionWithoutProps<Controller>
    ? HasKey<TController, typeof recommendationInternalOptionKey> extends never
      ? {}
      : RecommendationControllerSettings
    : unknown;

export type InferControllerPropsMapFromDefinitions<
  TControllers extends ControllerDefinitionsMap<Controller>,
> = {
  [K in keyof TControllers as HasKeys<
    InferControllerPropsFromDefinition<TControllers[K]>
  > extends false
    ? never
    : K]: InferControllerPropsFromDefinition<TControllers[K]>;
};

export type InferControllerFromDefinition<
  TDefinition extends ControllerDefinition<Controller>,
> = TDefinition extends ControllerDefinition<infer TController>
  ? TController
  : never;

export type InferControllersMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  [K in keyof TControllers as HasKey<
    TControllers[K],
    TSolutionType
  > extends never
    ? never
    : K]: InferControllerFromDefinition<TControllers[K]>;
};

export type InferControllerStaticStateMapFromDefinitionsWithSolutionType<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  [K in keyof TControllers as HasKey<
    TControllers[K],
    TSolutionType
  > extends never
    ? never
    : K]: InferControllerStaticStateFromController<
    InferControllerFromDefinition<TControllers[K]>
  >;
};
