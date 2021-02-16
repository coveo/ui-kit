import HeadlessPath from '@salesforce/resourceUrl/coveoheadless';
import AtomicPath from '@salesforce/resourceUrl/atomicutils';
// @ts-ignore
import {loadScript} from 'lightning/platformResourceLoader';

function getHeadlessEngine(element) {
  if (window.coveoHeadless) {
    return window.coveoHeadless;
  }
  try {
    window.coveoHeadless = getEngine(element);
    return window.coveoHeadless;
  } catch (error) {
    console.error('Fatal error: unable to initialize Coveo Headless', error);
    return undefined;
  }
}

async function getEngine(element) {
  await loadScript(element, HeadlessPath + '/browser/headless.js')
  await loadScript(element, AtomicPath + '/atomic-utils.js');

  const config = element.sample ? CoveoHeadless.HeadlessEngine.getSampleConfiguration() : element.config;
  return new CoveoHeadless.HeadlessEngine({
    configuration: config,
    reducers: CoveoHeadless.searchAppReducers,
  });
}

export { getHeadlessEngine }