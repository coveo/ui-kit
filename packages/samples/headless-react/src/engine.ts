import {
  HeadlessEngine,
  searchAppReducers,
  recommendationAppReducers,
} from '@coveo/headless';

export const engine = new HeadlessEngine({
  configuration: HeadlessEngine.getSampleConfiguration(),
  reducers: searchAppReducers,
});

export const recommendationEngine = new HeadlessEngine({
  configuration: HeadlessEngine.getSampleConfiguration(),
  reducers: recommendationAppReducers,
});
