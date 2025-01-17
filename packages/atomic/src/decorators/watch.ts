import {LitElement} from 'lit';

interface WatchedPropertiesConstructor extends Function {
  _watchedProperties?: Map<string | number | symbol, string[]>;
}

type PrivateProps = `_${string}`;
type ProtectedProps = `#${string}`;
type PublicProperties<T> = {
  [K in keyof T]: K extends PrivateProps | ProtectedProps | keyof LitElement
    ? never
    : T[K] extends Function
      ? never
      : K;
}[keyof T];

export function watch<Component extends LitElement>(
  propName: PublicProperties<Component>
) {
  return function (target: Component, propertyKey: string) {
    const constructor = target.constructor as WatchedPropertiesConstructor;

    if (!constructor._watchedProperties) {
      constructor._watchedProperties = new Map();
    }
    if (!constructor._watchedProperties.has(propName)) {
      constructor._watchedProperties.set(propName, []);
    }
    constructor._watchedProperties.get(propName)?.push(propertyKey);
    // @ts-expect-error: accessing a protected property
    const originalUpdated = target.willUpdate;
    // @ts-expect-error: accessing a protected property
    target.willUpdate = function (changedProperties: PropertyValues) {
      if (changedProperties.has(propName)) {
        const methods = constructor._watchedProperties?.get(propName);
        methods?.forEach((method) => {
          const callback = this[method as keyof LitElement];
          if (typeof callback === 'function') {
            (callback as Function).call(
              this,
              changedProperties.get(propName),
              this[propName as keyof LitElement]
            );
          }
        });
      }
      originalUpdated?.call(this, changedProperties);
    };
  };
}
