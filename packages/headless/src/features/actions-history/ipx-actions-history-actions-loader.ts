import {AsyncThunkAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../app/engine';
import {addPageViewEntryInActionsHistory} from './ipx-actions-history-actions';

/**
 * Internal and experimental actions loader for the IPX.
 * @internal
 * @deprecated
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
