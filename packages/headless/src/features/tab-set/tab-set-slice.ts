import {createReducer} from '@reduxjs/toolkit';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';
import {registerTab, updateActiveTab} from './tab-set-actions';
import {getTabSetInitialState, TabSetState} from './tab-set-state';

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
      .addCase(restoreSearchParameters, (state, action) => {
        const id = action.payload.tab || '';
        activateTabIfIdExists(state, id);
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
