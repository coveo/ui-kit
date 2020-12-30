import {Engine} from '@coveo/headless';
import {ComponentInterface, getElement, h} from '@stencil/core';
import {Schema, StringValue, SchemaValues} from '@coveo/bueno';

export type InitializeEventHandler = (engine: Engine) => void;
export type InitializeEvent = CustomEvent<InitializeEventHandler>;

export class InitializationError extends Error {
  constructor(elementName: string) {
    super(
      `The ${elementName} element must be the child of a configured atomic-search-interface element or have a "search-interface-id" attribute referencing a atomic-search-interface element.`
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
      componentDidRender,
      componentDidLoad,
      [initializeMethod]: initialize,
    } = component;
    const {
      errorProperty,
      engineProperty,
    } = initializationOptionsSchema.validate(options) as Required<
      InitializationOptions
    >;

    component.componentWillLoad = function () {
      const engine = this[engineProperty];
      if (engine) {
        initialize.call(this);
        return componentWillLoad && componentWillLoad.call(this);
      }

      const element = getElement(this);
      const externalSearchInterfaceId = element.getAttribute(
        'search-interface-id'
      );
      const searchInterfaceElement = externalSearchInterfaceId
        ? document.querySelector(
            `atomic-search-interface#${externalSearchInterfaceId}`
          )
        : null;
      const dispatchElement = searchInterfaceElement ?? element;

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
        cancelable: true,
      });

      const canceled = dispatchElement.dispatchEvent(event);
      if (canceled) {
        this[errorProperty] = new InitializationError(
          element.nodeName.toLowerCase()
        );
        return;
      }

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
