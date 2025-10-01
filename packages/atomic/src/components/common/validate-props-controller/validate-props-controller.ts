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

    if (this._propsHaveChanged(props)) {
      this._validateProps(props);
    }
  }

  private _validateProps(props: Object) {
    try {
      this.schema.validate(props);
    } catch (error) {
      this.host.error = error as Error;
    }
    this.previousProps = props;
  }

  private _propsHaveChanged(newProps: Object) {
    const newKeys = Object.keys(newProps);
    const oldKeys = Object.keys(this.previousProps);

    if (newKeys.length !== oldKeys.length) {
      return true;
    }

    return newKeys.some(
      (key) =>
        (newProps as Record<string, unknown>)[key] !==
        (this.previousProps as Record<string, unknown>)[key]
    );
  }
}
