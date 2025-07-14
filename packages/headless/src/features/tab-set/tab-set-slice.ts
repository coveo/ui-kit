import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions.js';
import {
  restoreSearchParameters,
  restoreTab,
} from '../search-parameters/search-parameter-actions.js';
import {registerTab, updateActiveTab} from './tab-set-actions.js';
import {getTabSetInitialState, type TabSetState} from './tab-set-state.js';

export const tabSetReducer = createReducer(
  getTabSetInitialState(),
  (builder) => {
    builder
      .addCase(registerTab, (state, action) => {
        const tab = action.payload;
        const {id} = tab;

        if (id in state) {
          return;
        }

        state[id] = {...tab, isActive: false};
      })
      .addCase(updateActiveTab, (state, action) => {
        const id = action.payload;
        activateTabIfIdExists(state, id);
      })
      .addCase(restoreTab, (state, action) => {
        const id = action.payload;
        activateTabIfIdExists(state, id);
      })
      .addCase(change.fulfilled, (state, action) => {
        return action.payload?.tabSet ?? state;
      })
      .addCase(restoreSearchParameters, (state, action) => {
        const id = action.payload.tab;
        if (!isNullOrUndefined(id)) {
          Object.keys(state).forEach((tabId) => {
            state[tabId].isActive = tabId === id;
          });
        }
      });
  }
);

function activateTabIfIdExists(state: TabSetState, id: string) {
  const hasId = id in state;

  if (!hasId) {
    return;
  }

  Object.keys(state).forEach((tabId) => {
    state[tabId].isActive = tabId === id;
  });
}
