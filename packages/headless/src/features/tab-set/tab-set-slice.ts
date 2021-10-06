import {createReducer} from '@reduxjs/toolkit';
import {registerTab, updateActiveTab} from './tab-set-actions';
import {getTabSetInitialState} from './tab-set-state';

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

        state[id] = tab;
      })
      .addCase(updateActiveTab, (state, action) => {
        const id = action.payload;
        const hasId = id in state;

        if (!hasId) {
          return;
        }

        Object.keys(state).forEach((tabId) => {
          state[tabId].isActive = tabId === id;
        });
      });
  }
);
