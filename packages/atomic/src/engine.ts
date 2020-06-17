import {HeadlessEngine, allReducers} from '@coveo/headless';

export const headlessEngine = new HeadlessEngine({
  configuration: HeadlessEngine.getSampleConfiguration(),
  reducers: allReducers,
});
