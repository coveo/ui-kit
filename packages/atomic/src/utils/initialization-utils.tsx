import {Engine} from '@coveo/headless';
import {ComponentInterface, getElement, h} from '@stencil/core';
import {Schema, StringValue, SchemaValues} from '@coveo/bueno';

type InitializeComponent = (engine: Engine) => void;
export type InitializeEvent = CustomEvent<InitializeComponent>;

const engineProviders = ['atomic-search-interface'];

interface EngineProviderElement extends Element {
  engine: Engine;
}

export class InitializationError extends Error {
  constructor(elementName: string) {
    super(
      `The ${elementName} element must be the child of a configured ${engineProviders.join(
        ' or '
      )} element.`
    );
    this.name = 'InitializationError';
  }
}

const initializationOptionsSchema = new Schema({
  errorProperty: new StringValue({default: 'error'}),
  engineProperty: new StringValue({default: 'engine'}),
});

export type InitializationOptions = SchemaValues<
  typeof initializationOptionsSchema
>;

export function Initialization(options?: InitializationOptions) {
  return (component: ComponentInterface, initializeMethod: string) => {
    const {
      componentWillLoad,
      render,
      [initializeMethod]: initialize,
    } = component;
    const {
      errorProperty,
      engineProperty,
    } = initializationOptionsSchema.validate(options) as Required<
      InitializationOptions
    >;

    component.componentWillLoad = function () {
      const element = getElement(this);
      const parentEngineProvider: EngineProviderElement | null = element.closest(
        engineProviders.join()
      );

      if (!parentEngineProvider) {
        this[errorProperty] = new InitializationError(
          element.nodeName.toLowerCase()
        );
        return;
      }

      const event = new CustomEvent('atomic/initializeComponent', {
        detail: (engine: Engine) => {
          this[engineProperty] = engine;
          try {
            initialize.call(this);
          } catch (error) {
            this[errorProperty] = error;
          }
        },
        bubbles: true,
      });
      element.dispatchEvent(event);

      return componentWillLoad && componentWillLoad.call(this);
    };

    if (!render) {
      console.error(
        'The "render" lifecycle method has to be defined for the InitializeComponent decorator to work.'
      );
    }

    component.render = function () {
      if (this[errorProperty]) {
        return (
          <atomic-component-error
            error={this[errorProperty]}
          ></atomic-component-error>
        );
      }

      if (!this[engineProperty]) {
        return;
      }

      return render && render.call(this);
    };
  };
}
