import type {CoreEngineNext} from './engine';

const stateKeyDescription = 'coveo-headless-internal-state';
// export const stateKey = Symbol.for(stateKeyDescription);
export const stateKey = stateKeyDescription;

export const redactEngine = <TEngine extends CoreEngineNext>(
  engine: TEngine
): TEngine => engine;

// TODO: REVERT back to symbol
// export const redactEngine = <TEngine extends CoreEngineNext>(
//   engine: TEngine
// ): TEngine =>
//   new Proxy(engine, {
//     ownKeys(target) {
//       return Reflect.ownKeys(target).filter((key) => key !== stateKey);
//     },
//     get(target, prop, receiver) {
//       // if (typeof prop === 'string' && prop !== stateKey) {
//       //   engine.logger.warn(
//       //     "You might be loading Headless twice. Please check your setup.\nIf you are trying to access the inner state... Don't"
//       //   );
//       // }
//       return Reflect.get(target, prop, receiver);
//     },
//   });
