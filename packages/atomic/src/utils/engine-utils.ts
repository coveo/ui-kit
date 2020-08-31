import {ComponentInterface, getElement} from '@stencil/core';
import {Engine} from '@coveo/headless';

const engineProviders = ['atomic-search-interface'];

interface EngineProviderElement extends Element {
  engine: Engine;
}

export function EngineProvider() {
  return (component: ComponentInterface, engineVariable: string) => {
    const {componentWillLoad} = component;
    if (!componentWillLoad) {
      console.error(
        'The "componentWillLoad" lifecycle method has to be defined for the EngineProvider decorator to work.'
      );
      return;
    }

    component.componentWillLoad = function () {
      const element = getElement(this);
      const parentEngineProvider: EngineProviderElement | null = element.closest(
        engineProviders.join()
      );
      component[engineVariable] = parentEngineProvider?.engine;
      return componentWillLoad.call(this);
    };
  };
}

export class EngineProviderError extends Error {
  constructor(elementName: string) {
    super(elementName);
    this.name = 'EngineProviderError';
    this.message = `The ${elementName} element must be the child of a configured ${engineProviders.join(
      ' or '
    )} element.`;
  }
}
