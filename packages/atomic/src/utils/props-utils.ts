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

      // Initializers run from the constructor. An element parsed from markup is upgraded with
      // its attributes already in place, so reading them here is enough for that case.
      (instance as Instance)[propertyKey] = readMappedAttributes() as Instance[K];

      // An element created programmatically has no attributes yet when the constructor runs:
      // frameworks call `document.createElement`, then set attributes, then insert. Reading
      // only in the constructor left the property empty forever, since these attributes are
      // prefixed (`must-match-source`, `depends-on-category`) and so never map to a reactive
      // property that Lit would observe. Read again once connected, which is after the
      // attributes have been set.
      instance.addController({
        hostConnected: () => {
          const props = readMappedAttributes();
          // Only overwrite when attributes were actually found, so a value assigned straight to
          // the property before insertion is preserved.
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
