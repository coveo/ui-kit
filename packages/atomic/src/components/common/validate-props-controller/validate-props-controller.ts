import type {Schema} from '@coveo/bueno';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {LitElementWithError} from '@/src/decorators/types';
import {deepEqual} from '@/src/utils/compare-utils';

export class ValidatePropsController<TProps extends Record<string, unknown>>
  implements ReactiveController
{
  private host: ReactiveControllerHost & LitElementWithError;
  private getProps: () => TProps;
  private schema: Schema<TProps>;
  private previousProps: TProps;

  constructor(
    host: ReactiveControllerHost & LitElementWithError,
    options: {getProps: () => TProps; schema: Schema<TProps>}
  ) {
    this.host = host;
    this.getProps = options.getProps;
    this.schema = options.schema;
    this.previousProps = {} as TProps;

    host.addController(this);
  }

  hostConnected() {
    this._validateProps(this.getProps());
  }

  hostUpdate() {
    const props = this.getProps();

    if (this._propsHaveChanged(props)) {
      // TODO - KIT-5099: Remove the ts-expect-error once we have a cleaner way to handle errors.
      // @ts-expect-error: we need to clear the error.
      this.host.error = undefined;
      this._validateProps(props);
    }
  }

  private _validateProps(props: TProps) {
    try {
      this.schema.validate(props);
    } catch (error) {
      this.host.error = error as Error;
    }
    this.previousProps = props;
  }

  private _propsHaveChanged(newProps: TProps) {
    return !deepEqual(newProps, this.previousProps);
  }
}
