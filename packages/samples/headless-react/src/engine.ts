import {
  HeadlessEngine,
  searchAppReducers,
  recommendationAppReducers,
  productRecommendationsAppReducers,
} from '@coveo/headless';

export const engine = new HeadlessEngine({
  configuration: HeadlessEngine.getSampleConfiguration(),
  reducers: searchAppReducers,
});

export const recommendationEngine = new HeadlessEngine({
  configuration: HeadlessEngine.getSampleConfiguration(),
  reducers: recommendationAppReducers,
});

export const productRecommendationEngine = new HeadlessEngine({
  configuration: HeadlessEngine.getSampleConfiguration(),
  reducers: productRecommendationsAppReducers,
});
