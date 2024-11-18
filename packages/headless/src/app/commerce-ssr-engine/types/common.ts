import {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {InvalidControllerDefinition} from '../../../utils/errors.js';
import type {CommerceEngine} from '../../commerce-engine/commerce-engine.js';
import type {CoreEngine, CoreEngineNext} from '../../engine.js';
import type {
  HasKey,
  InferControllerStaticStateMapFromControllers,
  InferControllerStaticStateFromController,
  InferControllerPropsMapFromDefinitions,
  ControllerStaticStateMap,
  EngineDefinitionBuildResult,
  HydratedState,
  OptionsTuple,
  ControllersPropsMap,
  HasKeys,
} from '../../ssr-engine/types/common.js';

export type {
  EngineDefinitionBuildResult,
  HydratedState,
  OptionsTuple,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
  InferControllerPropsMapFromDefinitions,
};

export enum SolutionType {
  search = 'search',
  listing = 'listing',
  standalone = 'standalone',
  recommendation = 'recommendation',
}

export interface ControllerDefinitionWithoutProps<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
> {
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @param solutionType - The type of solution for which the controller should be built (e.g. search or listing). This option only applies to sub-controllers.
   * @returns The created controller instance.
   */
  build(engine: TEngine, solutionType?: SolutionType): TController;
}

export interface ControllerDefinitionWithProps<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
  TProps,
> {
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @param props - The controller properties.
   * @param solutionType - The type of solution for which the controller should be built (e.g. search or listing). This option only applies to sub-controllers.
   * @returns The created controller instance.
   */
  buildWithProps(
    engine: TEngine,
    props: TProps,
    solutionType?: SolutionType
  ): TController;
}

export interface EngineStaticState<
  TSearchAction extends UnknownAction,
  TControllers extends ControllerStaticStateMap,
> {
  searchActions: TSearchAction[];
  controllers: TControllers;
}

export type ControllerDefinition<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
> =
  | ControllerDefinitionWithoutProps<TEngine, TController>
  | ControllerDefinitionWithProps<TEngine, TController, unknown>;

export interface ControllerDefinitionsMap<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
> {
  [customName: string]: ControllerDefinition<TEngine, TController>;
}

export type InferControllerPropsFromDefinition<
  TController extends ControllerDefinition<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> =
  TController extends ControllerDefinitionWithProps<
    CoreEngine | CoreEngineNext,
    Controller,
    infer Props
  >
    ? Props
    : TController extends ControllerDefinitionWithoutProps<
          CoreEngine | CoreEngineNext,
          Controller
        >
      ? {}
      : unknown;

export type InferControllerFromDefinition<
  TDefinition extends ControllerDefinition<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> =
  TDefinition extends ControllerDefinition<infer _, infer TController>
    ? TController
    : never;

export type InferControllersMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
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
  TControllers extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
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

export type EngineDefinitionControllersPropsOption<
  TControllers extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
  TControllersPropsMap extends ControllersPropsMap,
  TSolutionType extends SolutionType,
> = {
  [K in keyof TControllers as HasKey<
    TControllers[K],
    TSolutionType
  > extends never
    ? never
    : K]: HasKeys<TControllersPropsMap> extends false
    ? {}
    : {
        controllers: TControllersPropsMap;
      };
};

export interface ControllerDefinitionOption {
  /**
   * Whether the controller will be used in a product listing context.
   * @defaultValue true
   */
  listing?: boolean;
  /**
   * Whether the controller will be used in a search page context.
   * @defaultValue true
   */
  search?: boolean;
}

interface UniversalController {
  /**
   * @internal
   */
  [SolutionType.search]: true;
  /**
   * @internal
   */
  [SolutionType.listing]: true;
  /**
   * @internal
   */
  [SolutionType.standalone]: true;
}

interface SearchOnlyController {
  /**
   * @internal
   */
  [SolutionType.search]: true;
}

interface ListingOnlyController {
  /**
   * @internal
   */
  [SolutionType.listing]: true;
}

interface RecommendationOnlyController {
  /**
   * @internal
   */
  [SolutionType.recommendation]: true;
}

interface SearchAndListingController {
  /**
   * @internal
   */
  [SolutionType.search]: true;
  /**
   * @internal
   */
  [SolutionType.listing]: true;
}

export type SearchOnlyControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<CommerceEngine, TController> &
  SearchOnlyController;

export type SearchOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<CommerceEngine, TController, TProps> &
  SearchOnlyController;

export type ListingOnlyControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<CommerceEngine, TController> &
  ListingOnlyController;

export type ListingOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<CommerceEngine, TController, TProps> &
  ListingOnlyController;

export type RecommendationOnlyControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<CommerceEngine, TController> &
  RecommendationOnlyController;

export type RecommendationOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<CommerceEngine, TController, TProps> &
  RecommendationOnlyController;

export type UniversalControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<CommerceEngine, TController> &
  UniversalController;

export type UniversalControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<CommerceEngine, TController, TProps> &
  UniversalController;

export type SearchAndListingControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<CommerceEngine, TController> &
  SearchAndListingController;

export type SearchAndListingControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<CommerceEngine, TController, TProps> &
  SearchAndListingController;

export type SubControllerDefinitionWithoutProps<
  TController extends Controller,
  TDefinition extends ControllerDefinitionOption | undefined,
> = TDefinition extends {listing?: true; search?: true} | undefined
  ? SearchAndListingControllerDefinitionWithoutProps<TController>
  : TDefinition extends {listing?: true; search?: false}
    ? ListingOnlyControllerDefinitionWithoutProps<TController>
    : TDefinition extends {listing?: false; search?: true}
      ? SearchOnlyControllerDefinitionWithoutProps<TController>
      : TDefinition extends {listing: false; search: false}
        ? InvalidControllerDefinition
        : never;

export type SubControllerDefinitionWithProps<
  TController extends Controller,
  TDefinition extends ControllerDefinitionOption | undefined,
  TProps,
> = TDefinition extends {listing?: true; search?: true} | undefined
  ? SearchAndListingControllerDefinitionWithProps<TController, TProps>
  : TDefinition extends {listing?: true; search?: false}
    ? ListingOnlyControllerDefinitionWithProps<TController, TProps>
    : TDefinition extends {listing?: false; search?: true}
      ? SearchOnlyControllerDefinitionWithProps<TController, TProps>
      : TDefinition extends {listing: false; search: false}
        ? InvalidControllerDefinition
        : never;
