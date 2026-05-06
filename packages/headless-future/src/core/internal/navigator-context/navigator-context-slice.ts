import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {NavigatorContextState} from '@/src/core/interface/navigator-context/navigator-context-types.js';

export const initialNavigatorContextState: NavigatorContextState = {
  clientId: '',
  userAgent: null,
  url: null,
  referrer: null,
};

export const navigatorContextSlice = createSlice({
  name: 'navigatorContext',
  initialState: initialNavigatorContextState,
  reducers: {
    setClientId: (state, action: PayloadAction<string>) => {
      state.clientId = action.payload;
    },
    setUserAgent: (state, action: PayloadAction<string | null>) => {
      state.userAgent = action.payload;
    },
    setUrl: (state, action: PayloadAction<string | null>) => {
      state.url = action.payload;
    },
    setReferrer: (state, action: PayloadAction<string | null>) => {
      state.referrer = action.payload;
    },
    setNavigatorContext: (
      _state,
      action: PayloadAction<NavigatorContextState>
    ) => {
      return action.payload;
    },
  },
  selectors: {
    clientId: (state) => state.clientId,
    userAgent: (state) => state.userAgent,
    url: (state) => state.url,
    referrer: (state) => state.referrer,
  },
});
