import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions.js';
import {registerTab, updateActiveTab} from './tab-set-actions.js';
import {getTabSetInitialState, TabSetState} from './tab-set-state.js';

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
        console.log(JSON.parse(JSON.stringify(state)));
        activateTabIfIdExists(state, id);
      })
      .addCase(restoreSearchParameters, (state, action) => {
        const id = action.payload.tab || '';
        activateTabIfIdExists(state, id);
      })
      .addCase(change.fulfilled, (state, action) => {
        return action.payload?.tabSet ?? state;
      });
  }
);

function activateTabIfIdExists(state: TabSetState, id: string) {
  const hasId = id in state;

  if (!hasId) {
    const firstTabId = Object.keys(state)[0];
    if (firstTabId) {
      state[firstTabId].isActive = true;
    }
    return;
  }

  Object.keys(state).forEach((tabId) => {
    state[tabId].isActive = tabId === id;
  });
}
