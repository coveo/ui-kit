import {
  buildExecuteTrigger,
  SearchEngine,
  ExecuteTriggerParams,
} from '@coveo/headless';

/**
 * This sample create a headless execute trigger controller instance
 * and shows how to utilize the controller with the user defined functions.
 *
 * @param engine - a headless search engine instance
 * @returns An unsubscribe function
 */
export function bindExecuteTrigger(engine: SearchEngine) {
  const controller = buildExecuteTrigger(engine);

  const executeFunction = () => {
    const {functionName, params} = controller.state;

    if (functionName === 'log') {
      log(params);
    }
  };

  const log = (params: ExecuteTriggerParams) => {
    console.log('params: ', params);
  };

  const unsubscribe = controller.subscribe(() => executeFunction());
  return unsubscribe;
}
