import type {Schema} from '@coveo/bueno';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {deepEqual} from '@/src/utils/compare-utils';

/**
 * Logger interface for prop validation warnings.
 */
export interface PropValidationLogger {
  warn: (message: string) => void;
}

/**
 * A reactive controller that validates the props of a Lit component against a
 * provided Bueno schema.
 *
 * It validates the props when the host is connected to the DOM and whenever
 * the host updates, revalidating only if the props have changed since the last
 * validation.
 *
 * If validation fails and no logger is provided, the controller sets the `error` property on the host.
 * If a logger is provided, the controller logs a warning instead.
 */
export class ValidatePropsController<TProps extends Record<string, unknown>>
  implements ReactiveController
{
  private currentProps?: TProps;
  private previousProps?: TProps;

  /**
   * Creates a `ValidatePropsController`.
   *
   * @param host The host element.
   * @param getProps A function that returns the current props to validate.
   * @param schema The Bueno schema to validate the props against.
   * @param getLogger Optional function that returns a logger for logging validation warnings instead of setting errors.
   */
  constructor(
    private host: ReactiveControllerHost & HTMLElement & {error: Error},
    private getProps: () => TProps,
    private schema: Schema<TProps>,
    private getLogger?: () => PropValidationLogger | undefined
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

    // @ts-expect-error: we need to clear the error.
    this.host.error = undefined;
    this._validateProps();
  }

  private _validateProps() {
    try {
      this.schema.validate(this.currentProps);
    } catch (error) {
      const logger = this.getLogger?.();
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (logger) {
        logger.warn(errorMessage);
      } else {
        this.host.error =
          error instanceof Error ? error : new Error(errorMessage);
      }
    } finally {
      this.previousProps = this.currentProps;
    }
  }
}
