import {Controller} from '../../controllers';
import {CoreEngine} from '../engine';
import {
  ControllersMap,
  ControllersPropsMap,
  OptionsExtender,
} from './common-ssr-types';
import {EngineAndControllers} from './ssr-engine';

export interface EngineDefinitionBuildOptionsWithoutProps<TEngineOptions> {
  extend?: OptionsExtender<TEngineOptions>;
}

export interface EngineDefinitionBuildOptionsWithProps<
  TEngineOptions,
  TControllersProps extends ControllersPropsMap
> extends EngineDefinitionBuildOptionsWithoutProps<TEngineOptions> {
  controllers: TControllersProps;
}

export interface BuildWithProps<
  TEngine extends CoreEngine,
  TEngineOptions,
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap
> {
  /**
   * Initializes an engine and controllers from the definition.
   */
  build(
    options: EngineDefinitionBuildOptionsWithProps<
      TEngineOptions,
      TControllersProps
    >
  ): Promise<EngineAndControllers<TEngine, TControllersMap>>;
}

export interface BuildWithoutProps<
  TEngine extends CoreEngine,
  TEngineOptions,
  TControllersMap extends ControllersMap
> {
  /**
   * Initializes an engine and controllers from the definition.
   */
  build(
    options?: EngineDefinitionBuildOptionsWithoutProps<TEngineOptions>
  ): Promise<EngineAndControllers<TEngine, TControllersMap>>;
}

export interface ControllerDefinitionWithoutProps<
  TEngine extends CoreEngine,
  TController extends Controller
> {
  build(engine: TEngine): TController;
}

export interface ControllerDefinitionWithProps<
  TEngine extends CoreEngine,
  TController extends Controller,
  TProps
> {
  buildWithProps(engine: TEngine, props: TProps): TController;
}
