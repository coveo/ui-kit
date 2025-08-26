import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
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
  TEngine extends CoreEngine | CoreEngineNext,
  TProps,
  TController extends Controller = Controller,
> {
  private _definition: TDefinition;
  private _engine: TEngine;
  private _props?: TProps;
  private _additionalArgs: unknown[] = [];

  constructor(definition: TDefinition, engine: TEngine, props?: TProps) {
    this._definition = definition;
    this._engine = engine;
    this._props = props;
  }

  public withAdditionalArgs(additionalArgs: unknown[] = []): this {
    this._additionalArgs = additionalArgs;
    return this;
  }

  public build(): TController {
    if (
      'build' in this._definition &&
      typeof this._definition.build === 'function'
    ) {
      return this.buildWithoutProps();
    }
    if (
      'buildWithProps' in this._definition &&
      typeof this._definition.buildWithProps === 'function'
    ) {
      return this.buildWithProps();
    }
    throw new Error(
      'Controller definition must have a build or buildWithProps method.'
    );
  }

  private buildWithoutProps(): TController {
    const buildFn = this._definition.build!;
    return buildFn(this._engine, ...this._additionalArgs);
  }

  private buildWithProps(): TController {
    const buildWithPropsFn = this._definition.buildWithProps!;
    const controller = buildWithPropsFn(
      this._engine,
      this._props,
      ...this._additionalArgs
    );

    return {...controller, initialState: controller.state} as TController;
  }
}
