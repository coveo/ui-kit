import {createReducer} from '@reduxjs/toolkit';
import {registerRelativeDate} from './relative-date-actions';
import {getRelativeDateSetInitialState} from './relative-date-set-state';

export const relativeDateSetReducer = createReducer(
  getRelativeDateSetInitialState(),
  (builder) => {
    builder.addCase(registerRelativeDate, (state, {payload}) => {
      const {id, relativeDate, absoluteDate} = payload;
      if (id in state) {
        return;
      }

      const set = state[id];
      if (absoluteDate in set) {
        return;
      }

      set[absoluteDate] = relativeDate;
    });
  }
);
