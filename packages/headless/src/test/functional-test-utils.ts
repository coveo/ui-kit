import type {CoreEngine, CoreEngineNext} from '../app/engine.js';
import type {Controller} from '../controllers/controller/headless-controller.js';

function isEngine(obj: object): obj is CoreEngine {
  return 'dispatch' in obj;
}

export function waitForNextStateChange(
  target: Controller | CoreEngine | CoreEngineNext,
  options: {action?: () => void; expectedSubscriberCalls?: number} = {}
) {
  return new Promise<void>((resolve) => {
    let skipFirstCall = !isEngine(target);
    let subscriberCalls = 0;
    let unsubscribe = () => {};
    unsubscribe = target.subscribe(() => {
      if (skipFirstCall) {
        skipFirstCall = false;
        return;
      }
      if (++subscriberCalls < (options?.expectedSubscriberCalls ?? 1)) {
        return;
      }
      unsubscribe();
      resolve();
    });
    options.action?.();
  });
}
