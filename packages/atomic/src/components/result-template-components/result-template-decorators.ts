import {ComponentInterface, getElement} from '@stencil/core';

export function ResultContext() {
  return (component: ComponentInterface, resultVariable: string) => {
    const {render} = component;

    component.render = function () {
      const element = getElement(this);
      const parentResultComponent = element.closest('atomic-result');
      if (!parentResultComponent) {
        throw new Error(
          `The "${element.nodeName.toLowerCase()}" component has to be the child of an "atomic-result-template" component`
        );
      }
      component[resultVariable] = parentResultComponent.result;
      return render && render.call(this);
    };
  };
}

export function ResultContextRenderer(
  _component: ComponentInterface,
  _propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  descriptor.value = function () {
    const element = getElement(this);
    const parentResultTemplateComponent = element.closest(
      'atomic-result-template'
    );
    const parentResultComponent = element.closest('atomic-result');

    if (!parentResultTemplateComponent && !parentResultComponent) {
      throw new Error(
        `The "${element.nodeName.toLowerCase()}" component has to be the child of an "atomic-result-template" component`
      );
    }

    if (parentResultTemplateComponent) {
      return;
    }

    return originalMethod.call(this);
  };
}
