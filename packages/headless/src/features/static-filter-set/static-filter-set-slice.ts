import {createReducer} from '@reduxjs/toolkit';
import {registerStaticFilter} from './static-filter-set-actions';
import {getStaticFilterSetInitialState} from './static-filter-set-state';

export const staticFilterSetReducer = createReducer(
  getStaticFilterSetInitialState(),
  (builder) =>
    builder.addCase(registerStaticFilter, (state, action) => {
      const filter = action.payload;
      const {id} = filter;

      if (id in state) {
        return;
      }

      state[id] = filter;
    })
);
