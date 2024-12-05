import {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {InvalidControllerDefinition} from '../../../utils/errors.js';
import type {
  HasKey,
  InferControllerStaticStateMapFromControllers,
  InferControllerStaticStateFromController,
  ControllerStaticStateMap,
  EngineDefinitionBuildResult,
  HydratedState,
  OptionsTuple,
  EngineDefinitionControllersPropsOption,
  InferControllerPropsMapFromDefinitions,
} from '../../ssr-engine/types/common.js';
import {SSRCommerceEngine} from '../factories/build-factory.js';

export type {
  EngineDefinitionBuildResult,
  EngineDefinitionControllersPropsOption,
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

const recommendationOptionKey = 'recommendation-internal-options';
export const recommendationInternalOptionKey = Symbol.for(
  recommendationOptionKey
);

type RecommendationControllerSettings = {
  /**
   * Toggle to enable or disable the recommendation controller.
   * When set to `true`, the controller will be built and will perform a recommendation request server-side.
   * Otherwise, the controller will not be available in the client-side.
   *
   * @default false
   */
  enabled?: boolean;
};

export interface ControllerDefinitionWithoutProps<
  TController extends Controller,
> {
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @param solutionType - The type of solution for which the controller should be built (e.g. search or listing). This option only applies to sub-controllers.
   * @returns The created controller instance.
   */
  build(engine: SSRCommerceEngine, solutionType?: SolutionType): TController;
}

export interface ControllerDefinitionWithProps<
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
    engine: SSRCommerceEngine,
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

export type ControllerDefinition<TController extends Controller> =
  | ControllerDefinitionWithoutProps<TController>
  | ControllerDefinitionWithProps<TController, unknown>;

export interface ControllerDefinitionsMap<TController extends Controller> {
  [customName: string]: ControllerDefinition<TController>;
}

export type InferControllerPropsFromDefinition<
  TController extends ControllerDefinition<Controller>,
> =
  TController extends ControllerDefinitionWithProps<Controller, infer Props>
    ? HasKey<TController, typeof recommendationInternalOptionKey> extends never
      ? Props
      : Props & RecommendationControllerSettings
    : TController extends ControllerDefinitionWithoutProps<Controller>
      ? HasKey<
          TController,
          typeof recommendationInternalOptionKey
        > extends never
        ? {}
        : RecommendationControllerSettings
      : unknown;

export type InferControllerFromDefinition<
  TDefinition extends ControllerDefinition<Controller>,
> =
  TDefinition extends ControllerDefinition<infer TController>
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
> = ControllerDefinitionWithoutProps<TController> & SearchOnlyController;

export type SearchOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> & SearchOnlyController;

export type ListingOnlyControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> & ListingOnlyController;

export type ListingOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> & ListingOnlyController;

export type RecommendationOnlyControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> &
  RecommendationOnlyController;

export type RecommendationOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> &
  RecommendationOnlyController;

export type NonRecommendationControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> & UniversalController;

export type NonRecommendationControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> & UniversalController;

export type SearchAndListingControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<TController> & SearchAndListingController;

export type SearchAndListingControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<TController, TProps> &
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
