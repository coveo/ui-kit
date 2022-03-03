import {ComponentInterface, getElement} from '@stencil/core';
import {mapValues} from 'lodash';
import {camelToKebab, kebabToCamel} from './utils';

interface MapPropOptions {
  attributePrefix?: string;
  splitValues?: boolean;
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
      const prefix = opts?.attributePrefix ?? variableName;
      const attributes = getElement(this).attributes;
      const map = attributesToStringMap(prefix, Array.from(attributes));
      this[variableName] = opts?.splitValues
        ? stringMapToStringArrayMap(map)
        : map;
      componentWillLoad.call(this);
    };
  };
}

export function stringMapToStringArrayMap(map: Record<string, string>) {
  return mapValues(map, (value) =>
    value.split(',').map((subValue) => subValue.trim())
  );
}

export function attributesToStringMap(
  prefix: string,
  attributes: {name: string; value: string}[]
) {
  const mapVariable: Record<string, string> = {};
  const kebabPrefix = camelToKebab(prefix) + '-';
  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i];
    if (attribute.name.indexOf(kebabPrefix) !== 0) {
      continue;
    }

    const property = kebabToCamel(attribute.name.replace(kebabPrefix, ''));
    mapVariable[property] = `${attribute.value}`;
  }
  return mapVariable;
}
