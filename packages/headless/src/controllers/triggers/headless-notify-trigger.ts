import type {FrankensteinEngine} from '../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureSearchEngine} from '../../app/frankenstein-engine/frankenstein-engine-utils.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {logNotifyTrigger} from '../../features/triggers/trigger-analytics-actions.js';
import {
  buildCoreNotifyTrigger,
  type NotifyTrigger,
} from '../core/triggers/headless-core-notify-trigger.js';

/**
 * Creates a `NotifyTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `NotifyTrigger` controller instance.
 *
 * @group Controllers
 * @category NotifyTrigger
 * */
export function buildNotifyTrigger(
  engine: SearchEngine | FrankensteinEngine
): NotifyTrigger {
  return buildCoreNotifyTrigger(ensureSearchEngine(engine), {
    options: {
      logNotifyTriggerActionCreator: logNotifyTrigger,
    },
  });
}
