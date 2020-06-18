import {HeadlessEngine, searchPageReducers} from '@coveo/headless';

export const headlessEngine = new HeadlessEngine({
  configuration: HeadlessEngine.getSampleConfiguration(),
  reducers: searchPageReducers,
});
