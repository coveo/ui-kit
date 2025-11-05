import type {Schema} from '@coveo/bueno';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {deepEqual} from '@/src/utils/compare-utils';
import type {AnyBindings} from '../interface/bindings';

/**
 * A reactive controller that validates the props of a Lit component against a
 * provided Bueno schema.
 *
 * It validates the props when the host is connected to the DOM and whenever
 * the host updates, revalidating only if the props have changed since the last
 * validation.
 *
 * If validation fails, the controller logs a warning using the engine logger
 * and handles fallback values for specific properties to avoid breaking changes.
 */
export class ValidatePropsController<TProps extends Record<string, unknown>>
  implements ReactiveController
{
  private currentProps?: TProps;
  private previousProps?: TProps;

  /**
   * Creates a `ValidatePropsController`.
   *
   * @param host The host element with bindings.
   * @param getProps A function that returns the current props to validate.
   * @param schema The Bueno schema to validate the props against.
   */
  constructor(
    private host: ReactiveControllerHost &
      HTMLElement & {bindings?: AnyBindings},
    private getProps: () => TProps,
    private schema: Schema<TProps>
  ) {
    host.addController(this);
  }

  hostConnected() {
    this.currentProps = this.getProps();
    this._validateProps();
  }

  hostUpdate() {
    this.currentProps = this.getProps();

    if (deepEqual(this.currentProps, this.previousProps)) {
      return;
    }

    this._validateProps();
  }

  private _validateProps() {
    try {
      this.schema.validate(this.currentProps);
    } catch (error) {
      this._handleValidationError(error as Error);
    } finally {
      this.previousProps = this.currentProps;
    }
  }

  private _handleValidationError(error: Error) {
    const message = `Prop validation failed for component ${this.host.tagName?.toLowerCase()}: ${error.message}`;

    if (this.host.bindings?.engine?.logger?.warn) {
      this.host.bindings.engine.logger.warn(message, this.host);
    } else {
      console.warn(message, this.host);
    }
  }
}
