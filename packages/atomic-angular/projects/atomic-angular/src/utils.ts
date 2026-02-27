// biome-ignore-all lint/suspicious/noExplicitAny: Copied file from stencil angular output

import customElementsManifest from '@coveo/atomic/custom-elements-manifest';
import {fromEvent} from 'rxjs';

const createPropertyToAttributeMap = (): Map<string, string> => {
  const map = new Map<string, string>();

  customElementsManifest.modules.forEach((module: any) => {
    module.declarations?.forEach((declaration: any) => {
      if (declaration.kind === 'class' && declaration.attributes) {
        declaration.attributes.forEach((attr: any) => {
          if (attr.fieldName && attr.name) {
            map.set(attr.fieldName, attr.name);
          }
        });
      }
    });
  });

  return map;
};

const propertyToAttributeMap = createPropertyToAttributeMap();

const getAttributeName = (propertyName: string): string => {
  const mappedAttr = propertyToAttributeMap.get(propertyName);
  return mappedAttr || propertyName.replace(/([A-Z])/g, '-$1').toLowerCase();
};

export const proxyInputs = (Cmp: any, inputs: string[]) => {
  const Prototype = Cmp.prototype;
  inputs.forEach((item) => {
    Object.defineProperty(Prototype, item, {
      get() {
        return this.el[item];
      },
      set(val: any) {
        this.z.runOutsideAngular(() => {
          const attrName = getAttributeName(item);
          this.el.setAttribute(attrName, val);
        });
      },
      /**
       * In the event that proxyInputs is called
       * multiple times re-defining these inputs
       * will cause an error to be thrown. As a result
       * we set configurable: true to indicate these
       * properties can be changed.
       */
      configurable: true,
    });
  });
};

export const proxyMethods = (Cmp: any, methods: string[]) => {
  const Prototype = Cmp.prototype;
  methods.forEach((methodName) => {
    Prototype[methodName] = function () {
      // biome-ignore lint/complexity/noArguments: allow arguments usage here
      const args = arguments;
      return this.z.runOutsideAngular(() =>
        this.el[methodName].apply(this.el, args)
      );
    };
  });
};

export const proxyOutputs = (instance: any, el: any, events: string[]) => {
  events.forEach((eventName) => {
    instance[eventName] = fromEvent(el, eventName);
  });
};

export const defineCustomElement = (tagName: string, customElement: any) => {
  if (
    customElement !== undefined &&
    typeof customElements !== 'undefined' &&
    !customElements.get(tagName)
  ) {
    customElements.define(tagName, customElement);
  }
};

// biome-ignore-start lint/complexity/useArrowFunction: Allow function declaration for decorator
export function ProxyCmp(opts: {
  defineCustomElementFn?: () => void;
  inputs?: any;
  methods?: any;
}) {
  const decorator = function (cls: any) {
    const {defineCustomElementFn, inputs, methods} = opts;

    if (defineCustomElementFn !== undefined) {
      defineCustomElementFn();
    }

    if (inputs) {
      proxyInputs(cls, inputs);
    }
    if (methods) {
      proxyMethods(cls, methods);
    }
    return cls;
  };
  return decorator;
}
// biome-ignore-end lint/complexity/useArrowFunction: Allow function declaration for decorator
