import {isArray} from '@coveo/bueno';
import {type ComponentInterface, getElement} from '@stencil/core';
import type {ReactiveElement} from 'lit';
import {camelToKebab, kebabToCamel} from './utils';

interface MapPropOptions {
  attributePrefix?: string;
  splitValues?: boolean;
}

export function mapProperty<Element extends ReactiveElement>(
  options?: MapPropOptions
) {
  return <
    Instance extends Element & Record<string, unknown>,
    K extends keyof Instance,
  >(
    proto: ReactiveElement,
    propertyKey: K
  ) => {
    const ctor = proto.constructor as typeof ReactiveElement;

    ctor.createProperty(propertyKey, {type: Object});

    ctor.addInitializer((instance) => {
      const props = {};
      const prefix =
        options?.attributePrefix || camelToKebab(propertyKey.toString());

      mapAttributesToProp(
        prefix,
        props,
        Array.from(instance.attributes),
        options?.splitValues ?? false
      );

      (instance as Instance)[propertyKey] = props as Instance[K];
    });
  };
}

/**
 * @deprecated Use the `mapProperty` decorator instead.
 */
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
      const prefix = opts?.attributePrefix || variableName;
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

/**
 * @deprecated In Lit, you can achieve the same behavior by using `@property({type: Array})`.
 */
export function ArrayProp() {
  return (component: ComponentInterface, variableName: string) => {
    const {componentWillLoad} = component;

    const attributeWithBrackets = camelToKebab(variableName);

    component.componentWillLoad = function () {
      const value = this[variableName];
      if (!value || isArray(value)) {
        componentWillLoad?.call(this);
        return;
      }

      try {
        const valueAsArray = JSON.parse(value);
        if (isArray(valueAsArray)) {
          this[variableName] = valueAsArray;
        } else {
          console.error(
            `Property ${attributeWithBrackets} should be an array`,
            getElement(this)
          );
        }
      } catch (e) {
        console.error(
          `Error while parsing attribute ${attributeWithBrackets} as array`,
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
      // biome-ignore lint/performance/noAccumulatingSpread: <>
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
  const kebabPrefix = `${camelToKebab(prefix)}-`;
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
