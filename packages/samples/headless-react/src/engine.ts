import {
  HeadlessEngine,
  searchAppReducers,
  recommendationAppReducers,
} from '@coveo/headless';

export const engine = new HeadlessEngine({
  configuration: HeadlessEngine.getSampleConfiguration(),
  reducers: {
    ...searchAppReducers,
    ...recommendationAppReducers,
  },
});
