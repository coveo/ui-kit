import {createReducer} from '@reduxjs/toolkit';
import {sliceRedactorsMap} from '../../app/state-key.js';

sliceRedactorsMap.potato = () => undefined;

export const potato = createReducer(
  {
    potato: "HI I'M A POTATO",
  },
  () => {}
);
