import {createSelector} from '@reduxjs/toolkit';
import {TabSetState} from './tab-set-state.js';

export const selectActiveTab = createSelector(
  (state?: TabSetState) => state,
  (tabSetState?: TabSetState): string => {
    if (!tabSetState) {
      return '';
    }

    for (const tabId in tabSetState) {
      if (tabSetState[tabId].isActive) {
        return tabSetState[tabId].id;
      }
    }
    return '';
  }
);
