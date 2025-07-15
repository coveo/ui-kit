import type {AsyncThunkAction} from '@reduxjs/toolkit';
import type {CoreEngine} from '../../app/engine.js';
import {addPageViewEntryInActionsHistory} from './ipx-actions-history-actions.js';

/**
 * Internal and experimental actions loader for the IPX.
 * @internal
 */
export interface IPXActionsHistoryActionCreators {
  addPageViewEntryInActionsHistory(
    itemPermanentId: string
  ): AsyncThunkAction<void, string, {}>;
}

export function loadIPXActionsHistoryActions(
  engine: CoreEngine
): IPXActionsHistoryActionCreators {
  engine.addReducers({});

  return {
    addPageViewEntryInActionsHistory,
  };
}
