import type {ConfigurationState} from './configuration-state.js';

export const selectLocale = (state: {configuration: ConfigurationState}) =>
  state.configuration.search.locale;

export const selectTimezone = (state: {configuration: ConfigurationState}) =>
  state.configuration.search.timezone;
