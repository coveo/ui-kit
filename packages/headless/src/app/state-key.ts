import type {CoreEngine, CoreEngineNext} from './engine.js';
import {engineMarkerKey} from './engine-marker.js';

const stateKeyDescription = 'coveo-headless-internal-state';
export const stateKey = Symbol.for(stateKeyDescription);

const redactedKeys: symbol[] = [stateKey, engineMarkerKey];

export const redactEngine = <
  TEngine extends {[engineMarkerKey]: unknown} & object,
>(
  engine: TEngine,
  extraRedactedKeys: readonly symbol[] = []
): TEngine => {
  const allRedactedKeys =
    extraRedactedKeys.length > 0
      ? ([...redactedKeys, ...extraRedactedKeys] as symbol[])
      : redactedKeys;
  return new Proxy(engine, {
    ownKeys(target) {
      return Reflect.ownKeys(target).filter(
        (key) => !allRedactedKeys.includes(key as symbol)
      );
    },
    get(target, prop, receiver) {
      if (
        typeof prop === 'symbol' &&
        prop.description === stateKeyDescription &&
        prop !== stateKey
      ) {
        (target as unknown as CoreEngine | CoreEngineNext).logger?.warn(
          "You might be loading Headless twice. Please check your setup.\nIf you are trying to access the inner state... Don't"
        );
      }
      return Reflect.get(target, prop, receiver);
    },
  });
};
