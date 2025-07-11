import {createSelector} from '@reduxjs/toolkit';
import type {TabSetState} from './tab-set-state.js';

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

export const selectActiveTabExpression = createSelector(
  (state?: TabSetState) => state,
  (tabSetState?: TabSetState): string => {
    const activeTabId = selectActiveTab(tabSetState);
    return activeTabId && tabSetState
      ? tabSetState[activeTabId].expression
      : '';
  }
);
