import {ComponentInterface, getElement} from '@stencil/core';

export function ResultContext() {
  return (component: ComponentInterface, resultVariable: string) => {
    const {render} = component;
    component.render = function () {
      const element = getElement(this);
      const parentResultComponent = (element.getRootNode() as ShadowRoot)
        .host as HTMLAtomicResultElement;
      if (
        !parentResultComponent ||
        parentResultComponent.nodeName !== 'ATOMIC-RESULT'
      ) {
        console.error(
          `The "${element.nodeName.toLowerCase()}" component has to be used inside a template element 
          https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template`
        );
        element.remove();
        return null;
      }
      component[resultVariable] = parentResultComponent.result;
      return render && render.call(this);
    };
  };
}
