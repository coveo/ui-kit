import {ComponentInterface, getElement} from '@stencil/core';
import {camelToKebab, kebabToCamel} from './utils';

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
      const variable = this[variableName];
      const attributes = getElement(this).attributes;
      mapAttributesToProp(prefix, variable, Array.from(attributes));
      componentWillLoad.call(this);
    };
  };
}

export function mapAttributesToProp(
  prefix: string,
  mapVariable: Record<string, string[]>,
  attributes: {name: string; value: string}[]
) {
  const kebabPrefix = camelToKebab(prefix) + '-';
  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i];
    if (attribute.name.indexOf(kebabPrefix) !== 0) {
      continue;
    }

    const property = kebabToCamel(attribute.name.replace(kebabPrefix, ''));
    mapVariable[property] = `${attribute.value}`
      .split(',')
      .map((value) => value.trim());
  }
}
