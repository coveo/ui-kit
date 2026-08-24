import type {ReactiveElement} from 'lit';
import {camelToKebab, kebabToCamel} from './utils';

interface MapPropOptions {
  attributePrefix?: string;
  splitValues?: boolean;
}

export function mapProperty<Element extends ReactiveElement>(options?: MapPropOptions) {
  return <Instance extends Element & Record<string, unknown>, K extends keyof Instance>(
    proto: ReactiveElement,
    propertyKey: K
  ) => {
    const ctor = proto.constructor as typeof ReactiveElement;

    ctor.createProperty(propertyKey, {type: Object});

    ctor.addInitializer((instance) => {
      const prefix = options?.attributePrefix || camelToKebab(propertyKey.toString());

      const readMappedAttributes = () => {
        const props = {};
        mapAttributesToProp(
          prefix,
          props,
          Array.from(instance.attributes),
          options?.splitValues ?? false
        );
        return props;
      };

      // Covers elements written in markup: they are upgraded with their attributes already set.
      (instance as Instance)[propertyKey] = readMappedAttributes() as Instance[K];

      // Covers elements built in code, where the order is createElement, setAttribute, insert.
      // The constructor sees no attributes yet, and these are prefixed (`must-match-source`,
      // `depends-on-category`) so Lit never observes them either. Read once more on connect.
      instance.addController({
        hostConnected: () => {
          const props = readMappedAttributes();
          // Skip when there are no attributes, to keep a value assigned to the property directly.
          if (Object.keys(props).length > 0) {
            (instance as Instance)[propertyKey] = props as Instance[K];
          }
        },
      });
    });
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
  Object.assign(mapVariable, splitValues ? stringMapToStringArrayMap(map) : map);
}

function stringMapToStringArrayMap(map: Record<string, string>) {
  return Object.entries(map).reduce(
    (acc, [key, value]) => ({
      // oxlint-disable-next-line oxc/no-accumulating-spread -- <>
      ...acc,
      [key]: splitAttributeValueOnCommas(value).map((subValue) => subValue.trim()),
    }),
    {}
  );
}

function attributesToStringMap(prefix: string, attributes: {name: string; value: string}[]) {
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
