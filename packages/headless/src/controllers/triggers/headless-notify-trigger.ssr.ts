import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {NotifyTrigger, buildNotifyTrigger} from './headless-notify-trigger';

export * from './headless-notify-trigger';

export interface NotifyTriggerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, NotifyTrigger> {}

/**
 * Defines a `NotifyTrigger` controller instance.
 *
 * @returns The `NotifyTrigger` controller definition.
 * */
export function defineNotifyTrigger(): NotifyTriggerDefinition {
  return {
    build: (engine) => buildNotifyTrigger(engine),
  };
}
