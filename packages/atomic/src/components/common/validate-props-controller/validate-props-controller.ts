import type {Schema} from '@coveo/bueno';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {LitElementWithError} from '@/src/decorators/types';

export class ValidatePropsController implements ReactiveController {
  private host: ReactiveControllerHost & LitElementWithError;
  private getProps: () => Object;
  private schema: Schema<Object>;
  private previousProps: Object;

  constructor(
    host: ReactiveControllerHost & LitElementWithError,
    options: {getProps: () => Object; schema: Schema<Object>}
  ) {
    this.host = host;
    this.getProps = options.getProps;
    this.schema = options.schema;
    this.previousProps = {};

    host.addController(this);
  }

  hostConnected() {
    this._validateProps(this.getProps());
  }

  hostUpdate() {
    const props = this.getProps();

    if (!this._propsHaveChanged(props)) {
      return;
    }

    this._validateProps(props);
  }

  private _validateProps(props: Object) {
    try {
      this.schema.validate(props);
      this.previousProps = props;
    } catch (error) {
      this.host.error = error as Error;
    }
  }

  private _propsHaveChanged(newProps: Object) {
    return JSON.stringify(newProps) !== JSON.stringify(this.previousProps);
  }
}
