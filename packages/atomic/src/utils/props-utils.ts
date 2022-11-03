import {isArray} from '@coveo/bueno';
import {ComponentInterface, getElement} from '@stencil/core';
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
      const prefix = (opts && opts.attributePrefix) || variableName;
      const variable = this[variableName];
      const attributes = getElement(this).attributes;
      mapAttributesToProp(
        prefix,
        variable,
        Array.from(attributes),
        opts?.splitValues ?? false
      );
      componentWillLoad.call(this);
    };
  };
}

export function ArrayProp() {
  return (component: ComponentInterface, variableName: string) => {
    const {componentWillLoad} = component;
    const attributeWithBackets = camelToKebab(variableName);

    component.componentWillLoad = function () {
      const attr =
        getElement(this).attributes.getNamedItem(attributeWithBackets);
      if (!attr) {
        componentWillLoad?.call(this);
        return;
      }

      try {
        const valueAsArray = JSON.parse(attr.value);
        if (isArray(valueAsArray)) {
          this[variableName] = valueAsArray;
        } else {
          console.error(
            `Property ${attributeWithBackets} should be an array`,
            getElement(this)
          );
        }
      } catch (e) {
        console.error(
          `Error while parsing attribute ${attributeWithBackets} as array`,
          e
        );
      }

      componentWillLoad?.call(this);
    };
  };
}

function splitAttributeValueOnCommas(attributeValue: string) {
  const splitButIgnoreEscapeSymbolsExpression = /(?:\\.|[^,])+/g;
  const [...valuesWithEscapeSymbols] =
    attributeValue.matchAll(splitButIgnoreEscapeSymbolsExpression) ?? [];

  const removeEscapeSymbolsExpression = /\\(.)/g;
  return valuesWithEscapeSymbols.map(([valuesWithEscapeSymbols]) =>
    valuesWithEscapeSymbols.replace(removeEscapeSymbolsExpression, '$1')
  );
}

export function mapAttributesToProp(
  prefix: string,
  mapVariable: Record<string, string | string[]>,
  attributes: {name: string; value: string}[],
  splitValues: boolean
) {
  const map = attributesToStringMap(prefix, attributes);
  Object.assign(
    mapVariable,
    splitValues ? stringMapToStringArrayMap(map) : map
  );
}

function stringMapToStringArrayMap(map: Record<string, string>) {
  return Object.entries(map).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: splitAttributeValueOnCommas(value).map((subValue) =>
        subValue.trim()
      ),
    }),
    {}
  );
}

function attributesToStringMap(
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
