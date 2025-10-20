import type {Schema} from '@coveo/bueno';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {deepEqual} from '@/src/utils/compare-utils';

/**
 * A reactive controller that validates the props of a Lit component against a
 * provided Bueno schema.
 *
 * It validates the props when the host is connected to the DOM and whenever
 * the host updates, revalidating only if the props have changed since the last
 * validation.
 *
 * If validation fails, the controller sets the `error` property on the host.
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
   */
  constructor(
    private host: ReactiveControllerHost & HTMLElement & {error: Error},
    private getProps: () => TProps,
    private schema: Schema<TProps>
  ) {
    host.addController(this);
  }

  hostConnected() {
    this.currentProps = this.getProps();
    if (this.host.error === null) {
      // @ts-expect-error: we need to set the error to undefined if it was null.
      this.host.error = undefined;
    }
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
      this.host.error = error as Error;
    } finally {
      this.previousProps = this.currentProps;
    }
  }
}
