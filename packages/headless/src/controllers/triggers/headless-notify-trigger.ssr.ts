import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {NotifyTrigger, buildNotifyTrigger} from './headless-notify-trigger';

export * from './headless-notify-trigger';

/**
 * @alpha
 */
export const defineNotifyTrigger = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  NotifyTrigger
> => ({
  build: (engine) => buildNotifyTrigger(engine),
});
