import {Engine} from '@coveo/headless-future';
import {getSampleConfiguration} from './env.js';

export function buildSampleEngine() {
  const configuration = getSampleConfiguration();
  return new Engine(configuration);
}
