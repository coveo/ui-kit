import {HeadlessEngine, searchAppReducers} from '@coveo/headless';

export const engine = new HeadlessEngine({
  configuration: HeadlessEngine.getSampleConfiguration(),
  reducers: searchAppReducers
})