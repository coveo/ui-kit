import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {NotifyTrigger, buildNotifyTrigger} from './headless-notify-trigger.js';

export * from './headless-notify-trigger.js';

/**
 * @internal
 */
export const defineNotifyTrigger = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  NotifyTrigger
> => ({
  build: (engine) => buildNotifyTrigger(engine),
});
