import type {Controller} from '../../../controllers/controller/headless-controller';
import type {InvalidControllerDefinition} from '../../../utils/errors';
import type {CommerceEngine} from '../../commerce-engine/commerce-engine';
import type {CoreEngine, CoreEngineNext} from '../../engine';
import type {
  HasKey,
  InferControllerStaticStateMapFromControllers,
  InferControllerStaticStateFromController,
} from '../../ssr-engine/types/common';

export type {
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
};

export enum SolutionType {
  search = 'search',
  listing = 'listing',
  // Recommendation = 'recommendation',
}

export interface ControllerDefinitionWithoutProps<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
  TSolutionType extends
    | SolutionType
    | SolutionType.search
    | SolutionType.listing,
> {
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @param solutionType - The type of solution for which the controller should be built (e.g. search or listing). This option only applies to sub-controllers.
   * @returns The created controller instance.
   */
  build(engine: TEngine, solutionType?: TSolutionType): TController;
}

export interface ControllerDefinitionWithProps<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
  TProps,
  TSolutionType extends
    | SolutionType
    | SolutionType.search
    | SolutionType.listing,
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
    solutionType?: TSolutionType
  ): TController;
}

export type ControllerDefinition<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
> =
  | ControllerDefinitionWithoutProps<TEngine, TController, SolutionType>
  | ControllerDefinitionWithProps<TEngine, TController, unknown, SolutionType>;

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
    infer Props,
    SolutionType
  >
    ? Props
    : TController extends ControllerDefinitionWithoutProps<
          CoreEngine | CoreEngineNext,
          Controller,
          SolutionType
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

export interface ControllerDefinitionOption {
  /**
   * Whether the controller is used in a product listing context.
   * @defaultValue true
   */
  listing?: boolean;
  /**
   * Whether the controller is used in a search page context.
   * @defaultValue true
   */
  search?: boolean;
}

export interface SearchOnlyController<TController> {
  /**
   * @internal
   */
  [SolutionType.search]: true;
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @param solutionType - The type of solution for which the controller should be built (e.g. search or listing).
   * @returns The created controller instance.
   */
  build(engine: CommerceEngine, solutionType: SolutionType.search): TController;
}

export interface ListingOnlyController<TController extends Controller> {
  /**
   * @internal
   */
  [SolutionType.listing]: true;
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @param solutionType - The type of solution for which the controller should be built (e.g. search or listing).
   * @returns The created controller instance.
   */
  build(
    engine: CommerceEngine,
    solutionType: SolutionType.listing
  ): TController;
}

export interface SharedController<TController extends Controller> {
  /**
   * @internal
   */
  [SolutionType.search]: true;
  [SolutionType.listing]: true;
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @param solutionType - The type of solution for which the controller should be built (e.g. search or listing).
   * @returns The created controller instance.
   */
  build(engine: CommerceEngine, solutionType: SolutionType): TController;
}

export type SearchOnlyControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<
  CommerceEngine,
  TController,
  SolutionType.search
> &
  SearchOnlyController<TController>;

export type SearchOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<
  CommerceEngine,
  TController,
  TProps,
  SolutionType.search
> &
  SearchOnlyController<TController>;

export type ListingOnlyControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<
  CommerceEngine,
  TController,
  SolutionType.listing
> &
  ListingOnlyController<TController>;

export type ListingOnlyControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<
  CommerceEngine,
  TController,
  TProps,
  SolutionType.listing
> &
  ListingOnlyController<TController>;

export type SharedControllerDefinitionWithoutProps<
  TController extends Controller,
> = ControllerDefinitionWithoutProps<
  CommerceEngine,
  TController,
  SolutionType
> &
  SharedController<TController>;

export type SharedControllerDefinitionWithProps<
  TController extends Controller,
  TProps,
> = ControllerDefinitionWithProps<
  CommerceEngine,
  TController,
  TProps,
  SolutionType
> &
  SharedController<TController>;

export type SubControllerDefinitionWithoutProps<
  TController extends Controller,
  TDefinition extends ControllerDefinitionOption | undefined,
> = TDefinition extends {listing?: true; search?: true} | undefined
  ? SharedControllerDefinitionWithoutProps<TController>
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
  ? SharedControllerDefinitionWithProps<TController, TProps>
  : TDefinition extends {listing?: true; search?: false}
    ? ListingOnlyControllerDefinitionWithProps<TController, TProps>
    : TDefinition extends {listing?: false; search?: true}
      ? SearchOnlyControllerDefinitionWithProps<TController, TProps>
      : TDefinition extends {listing: false; search: false}
        ? InvalidControllerDefinition
        : never;

export type DefinedSolutionTypes<
  TDefinition extends ControllerDefinitionOption | undefined,
> = TDefinition extends {listing?: true; search?: true} | undefined
  ? SolutionType
  : TDefinition extends {listing?: true; search?: false}
    ? SolutionType.listing
    : TDefinition extends {listing?: false; search?: true}
      ? SolutionType.search
      : TDefinition extends {listing: false; search: false}
        ? InvalidControllerDefinition
        : never;
