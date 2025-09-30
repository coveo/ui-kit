import {createSelector} from '@reduxjs/toolkit';
import type {ConfigurationState} from './configuration-state.js';

export const selectLocale = createSelector(
  (state: {configuration: ConfigurationState}) =>
    state.configuration.search.locale,
  (locale) => locale
);

export const selectTimezone = createSelector(
  (state: {configuration: ConfigurationState}) =>
    state.configuration.search.timezone,
  (timezone) => timezone
);
