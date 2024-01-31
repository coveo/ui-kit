import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {NotifyTrigger, buildNotifyTrigger} from './headless-notify-trigger';

export * from './headless-notify-trigger';

/**
 * Defines a `NotifyTrigger` controller instance.
 *
 * @returns The `NotifyTrigger` controller definition.
 * */
export function defineNotifyTrigger(): ControllerDefinitionWithoutProps<
  SearchEngine,
  NotifyTrigger
> {
  return {
    build: (engine) => buildNotifyTrigger(engine),
  };
}
