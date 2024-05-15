import type {CoreEngineNext} from './engine';

const stateKeyDescription = 'state';
export const stateKey = Symbol(stateKeyDescription);

export const redactEngine = <TEngine extends CoreEngineNext>(
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
