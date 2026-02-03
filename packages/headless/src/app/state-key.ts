import {createSelector} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from './engine.js';

const stateKeyDescription = 'coveo-headless-internal-state';
export const stateKey = Symbol.for(stateKeyDescription);

export const redactEngine = <TEngine extends CoreEngineNext | CoreEngine>(
  engine: TEngine
): TEngine =>
  new Proxy(engine, {
    ownKeys(target) {
      return Reflect.ownKeys(target).filter((key) => key !== stateKey);
    },
    get(target, prop, receiver) {
      if (
        typeof prop === 'symbol' &&
        prop.description === stateKeyDescription &&
        prop !== stateKey
      ) {
        engine.logger.warn(
          "You might be loading Headless twice. Please check your setup.\nIf you are trying to access the inner state... Don't"
        );
      }
      return Reflect.get(target, prop, receiver);
    },
  });

export const sliceRedactorsMap: Record<
  string,
  (stateSlice: unknown) => undefined | object
> = {};

export const selectPublicState = createSelector(
  [(state: unknown) => state],
  (internalState) => {
    for (const redactor in sliceRedactorsMap) {
      if (internalState[redactor]) {
        internalState[redactor] = sliceRedactorsMap[redactor](
          internalState[redactor]
        );
      }
    }
    return internalState;
  }
);
