import {Engine} from '@coveo/headless';
import {ComponentInterface, getElement, h} from '@stencil/core';
import {Schema, StringValue, SchemaValues} from '@coveo/bueno';
import {i18n} from 'i18next';

export type InitializeEventHandler = (engine: Engine, i18n: i18n) => void;
export type InitializeEvent = CustomEvent<InitializeEventHandler>;

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
  i18nProperty: new StringValue({default: 'i18n'}),
});

export type InitializationOptions = SchemaValues<
  typeof initializationOptionsSchema
>;

export function Initialization(options?: InitializationOptions) {
  return (component: ComponentInterface, initializeMethod: string) => {
    const {
      componentWillLoad,
      render,
      componentDidRender,
      componentDidLoad,
      [initializeMethod]: initialize,
    } = component;
    const {
      errorProperty,
      engineProperty,
      i18nProperty,
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
        detail: (engine: Engine, i18n: i18n) => {
          this[engineProperty] = engine;
          this[i18nProperty] = i18n;
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

    let hasRendered = false;
    let hasLoaded = false;

    component.render = function () {
      if (this[errorProperty]) {
        hasRendered = true;
        return (
          <atomic-component-error
            error={this[errorProperty]}
          ></atomic-component-error>
        );
      }

      if (!this[engineProperty]) {
        return;
      }

      hasRendered = true;
      return render && render.call(this);
    };

    component.componentDidRender = function () {
      if (!hasRendered) {
        return;
      }

      componentDidRender && componentDidRender.call(this);
      if (!hasLoaded) {
        componentDidLoad && componentDidLoad.call(this);
        hasLoaded = true;
      }
      return;
    };

    component.componentDidLoad = function () {};
  };
}
