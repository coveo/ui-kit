import {createAction} from '@reduxjs/toolkit';
import type {ConfigurationState} from './configuration-types.js';

const ACTION_PREFIX = 'configuration';

export const setOrganizationId = createAction<string>(`${ACTION_PREFIX}/setOrganizationId`);

export const setAccessToken = createAction<string>(`${ACTION_PREFIX}/setAccessToken`);

export const setTrackingId = createAction<string>(`${ACTION_PREFIX}/setTrackingId`);

export const setLanguage = createAction<string>(`${ACTION_PREFIX}/setLanguage`);

export const setCountry = createAction<string>(`${ACTION_PREFIX}/setCountry`);

export const setCurrency = createAction<string>(`${ACTION_PREFIX}/setCurrency`);

export const setEndpoint = createAction<string | undefined>(`${ACTION_PREFIX}/setEndpoint`);

export const setConfiguration = createAction<ConfigurationState>(
  `${ACTION_PREFIX}/setConfiguration`
);
