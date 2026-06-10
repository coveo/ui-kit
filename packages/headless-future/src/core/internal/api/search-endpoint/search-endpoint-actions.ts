import {createAction} from '@reduxjs/toolkit';
import type {SearchEndpointStatus} from '@/src/core/interface/api/search-endpoint/search-endpoint-types.js';

const ACTION_PREFIX = 'searchEndpoint';

export const setStatus = createAction<SearchEndpointStatus>(
  `${ACTION_PREFIX}/setStatus`
);

export const setError = createAction<string | null>(
  `${ACTION_PREFIX}/setError`
);

export const setConfiguration = createAction<Record<string, any>>(
  `${ACTION_PREFIX}/setConfiguration`
);
