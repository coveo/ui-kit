import type {Controller} from '../../../controllers/controller/headless-controller';
import type {InvalidControllerDefinition} from '../../../utils/errors';
import type {CommerceEngine} from '../../commerce-engine/commerce-engine';
import type {CoreEngine, CoreEngineNext} from '../../engine';
import type {
  HasKey,
  InferControllerStaticStateMapFromControllers,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromDefinitions,
} from '../../ssr-engine/types/common';

export type {
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromDefinitions,
  InferControllerStaticStateMapFromControllers,
};

export enum SolutionType {
  Search = 'search',
  Listing = 'listing',
  // Recommendation = 'recommendation',
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

export interface SearchOnlyControllerDefinition<TController extends Controller>
  // TODO: also apply the same logic to controllers with props
  extends ControllerDefinitionWithoutProps<CommerceEngine, TController> {
  /**
   * @internal
   */
  [SolutionType.Search]: true;
}

export interface ListingOnlyControllerDefinition<TController extends Controller>
  // TODO: also apply the same logic to controllers with props
  extends ControllerDefinitionWithoutProps<CommerceEngine, TController> {
  /**
   * @internal
   */
  [SolutionType.Listing]: true;
}

export interface SharedControllerDefinition<TController extends Controller>
  // TODO: also apply the same logic to controllers with props
  extends ControllerDefinitionWithoutProps<CommerceEngine, TController> {
  /**
   * @internal
   */
  [SolutionType.Search]: true;
  [SolutionType.Listing]: true;
}

export type SolutionTypeControllerDefinition<
  TController extends Controller,
  TDefinition extends ControllerDefinitionOption | undefined,
> = TDefinition extends {listing?: true; search?: true} | undefined
  ? SharedControllerDefinition<TController>
  : TDefinition extends {listing?: true; search?: false}
    ? ListingOnlyControllerDefinition<TController>
    : TDefinition extends {listing?: false; search?: true}
      ? SearchOnlyControllerDefinition<TController>
      : TDefinition extends {listing: false; search: false}
        ? InvalidControllerDefinition
        : never;
