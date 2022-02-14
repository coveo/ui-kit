import {EventDescription} from 'coveo.analytics';

export interface AnalyticsState extends EventDescription {}

export const getAnalyticsInitialState: () => AnalyticsState = () => ({
  actionCause: '',
  customData: {},
});
