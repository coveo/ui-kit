import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {SSRCommerceEngine} from '../../commerce/factories/build-factory.js';
import type {
  BaseControllerDefinitionWithoutProps,
  BaseControllerDefinitionWithProps,
} from '../types/controllers.js';

/**
 * Builder class for creating controllers from definitions
 */
export class ControllerBuilder<
  TDefinition extends Partial<
    BaseControllerDefinitionWithoutProps<TEngine, TController>
  > &
    Partial<BaseControllerDefinitionWithProps<TEngine, TController, TProps>>,
  TEngine extends CoreEngine | CoreEngineNext | SSRCommerceEngine,
  TProps,
  TController extends Controller = Controller,
> {
  private definition: TDefinition;
  private engine: TEngine;
  private props?: TProps;
  private additionalArgs: unknown[] = [];

  constructor(definition: TDefinition, engine: TEngine, props?: TProps) {
    this.definition = definition;
    this.engine = engine;
    this.props = props;
  }

  public setAdditionalArgs(additionalArgs: unknown[] = []): this {
    this.additionalArgs = additionalArgs;
    return this;
  }

  public build(): TController {
    if ('build' in this.definition) {
      return this.buildWithoutProps();
    } else {
      return this.buildWithProps();
    }
  }

  private buildWithoutProps(): TController {
    const buildFn = this.definition.build!;
    return buildFn(this.engine, ...this.additionalArgs);
  }

  private buildWithProps(): TController {
    const buildWithPropsFn = this.definition.buildWithProps!;
    const controller = buildWithPropsFn(
      this.engine,
      this.props,
      ...this.additionalArgs
    );

    return {...controller, initialState: controller.state} as TController;
  }
}
