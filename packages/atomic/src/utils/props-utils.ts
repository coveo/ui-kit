import {ComponentInterface, getElement} from '@stencil/core';
import {camelToKebab} from './utils';

interface MapPropOptions {
  attributePrefix: string;
}
export function MapProp(opts?: MapPropOptions) {
  return (component: ComponentInterface, variableName: string) => {
    const {componentWillLoad} = component;
    if (!componentWillLoad) {
      console.error(
        'The "componentWillLoad" lifecycle method has to be defined for the MapProp decorator to work.'
      );
      return;
    }

    component.componentWillLoad = function () {
      const prefix = (opts && opts.attributePrefix) || variableName;
      const kebabPrefix = camelToKebab(prefix) + '-';
      const variable = this[variableName];
      const attributes = getElement(this).attributes;

      for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        if (attribute.name.indexOf(kebabPrefix) !== 0) {
          continue;
        }

        variable[attribute.name.replace(kebabPrefix, '')] =
          `${attribute.value}`.split(',');
      }

      componentWillLoad.call(this);
    };
  };
}
