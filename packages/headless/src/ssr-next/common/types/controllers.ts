import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';

export interface ControllersMap {
  [customName: string]: Controller;
}

export interface ControllerStaticState<TState> {
  state: TState;
}

export interface ControllerStaticStateMap {
  [customName: string]: ControllerStaticState<unknown>;
}

export interface BaseControllerDefinitionWithoutProps<
  TEngine,
  TController extends Controller,
> {
  build(engine: TEngine, ...args: unknown[]): TController;
}

export interface BaseControllerDefinitionWithProps<
  TEngine,
  TController extends Controller,
  TProps,
> {
  buildWithProps(
    engine: TEngine,
    props?: TProps,
    ...args: unknown[]
  ): TController;
}

// TODO: KIT-4691: this is a type only used by search. Move into the search folder
export interface ControllerDefinitionWithoutProps<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
> {
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @returns The controller.
   */
  build(engine: TEngine): TController;
}

// TODO: KIT-4691: this is a type only used by search. Move into the search folder
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
   * @returns The controller.
   */
  buildWithProps(engine: TEngine, props?: TProps): TController;
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

export interface ControllersPropsMap {
  [customName: string]: unknown;
}
