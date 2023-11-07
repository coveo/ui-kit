import {createReducer} from '../../../ssr.index';
import {getCommerceSearchInitialState} from './search-state';

export const searchReducer = createReducer(
  getCommerceSearchInitialState(),

  (builder) => {
    builder
  }
);
