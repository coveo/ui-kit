import HeadlessPath from '@salesforce/resourceUrl/coveoheadless';
import AtomicPath from '@salesforce/resourceUrl/atomicutils';
// @ts-ignore	
import { loadScript } from 'lightning/platformResourceLoader';
// @ts-ignore	
import { Debouncer } from 'c/utils';

const DEBOUNCE_DELAY = 200;
let debouncers = {};

/**
 * Cancels the delayed search query.
 * @param {String} engineId
 */
const cancelInitialSearch = (engineId) => {
  if (debouncers[engineId]) {
    debouncers[engineId].clearTimeout();
    delete debouncers[engineId];
  }
}

/**
 * Dispatches search request.
 * @param {String} engineId
 */
const executeInitialSearch = (engineId) => {
  window.coveoHeadless[engineId].engine.then((engine) => {
    engine.dispatch(
      CoveoHeadless.SearchActions.executeSearch(
        CoveoHeadless.AnalyticsActions.logInterfaceLoad()
      )
    );
  });
};

/**
 * 
 * @param {String} engineId 
 */
const debounceInitialSearch = (engineId) => {
  if (!debouncers[engineId]) {
    debouncers[engineId] = new Debouncer();
  }
  debouncers[engineId].debounce(executeInitialSearch, DEBOUNCE_DELAY)(engineId);
};

/**
 * Returns true if registered components are initialized, false otherwise.
 * @param {String} engineId
 */
const areAllComponentsInitialized = (engineId) => 
  !window.coveoHeadless[engineId].components.find(component => component.initialized === false);

/**
 * Returns the registered component object if it exists. 
 * @param element
 * @param {String} engineId
 */
const getRegisteredComponent = (element, engineId) => window.coveoHeadless[engineId].components.find((component) => component.element === element);

/**
 * Loads dependencies and returns an initialized Headless engine. 
 * @param element
 */
async function initEngine(element) {
  let engine;
  try {
    await loadScript(element, HeadlessPath + '/browser/headless.js');
    await loadScript(element, AtomicPath + '/atomic-utils.js');
  
    const config = CoveoHeadless.HeadlessEngine.getSampleConfiguration();
  
    engine = new CoveoHeadless.HeadlessEngine({
      configuration: config,
      reducers: CoveoHeadless.searchAppReducers,
    });
  } catch (error) {
    throw new Error('Fatal error: unable to initialize Coveo Headless: ' + error);
  }
  return engine;
}

/**
 * Registers a component for future initialization.
 * @param element
 * @param {String} engineId
 */
function registerComponentForInit(element, engineId) {
  cancelInitialSearch(engineId);
  if (!window.coveoHeadless) {
    window.coveoHeadless = {
      [engineId]: {
        components: [],
        engine: undefined
      }
    }
  } else if (!window.coveoHeadless[engineId]) {
    window.coveoHeadless[engineId] = {
      components: [],
      engine: undefined
    }
  }
  const coveoHeadless = window.coveoHeadless[engineId];

  if (!getRegisteredComponent(element, engineId)) {
    coveoHeadless.components.push({
      element,
      initialized: false
    });
  }
}

/**
 * Sets registered component to initialized.
 * @param element
 * @param {String} engineId
 */
function setComponentInitialized(element, engineId) {
  const component = window.coveoHeadless
    && window.coveoHeadless[engineId]
    ? getRegisteredComponent(element, engineId)
    : undefined;

  if (!component) {
    throw new Error('Fatal Error: Component was not registered before initialization');
  }
  component.initialized = true;
  if (areAllComponentsInitialized(engineId)) {
    debounceInitialSearch(engineId);
  }
}

/**
 * Returns headless engine promise.
 * @param element The Lightning Element component with which to load dependencies.
 * @param {String} engineId
 */
function getHeadlessEngine(element, engineId) {
  if (window.coveoHeadless[engineId] && window.coveoHeadless[engineId].engine) {
    return window.coveoHeadless[engineId].engine;
  }
  window.coveoHeadless[engineId].engine = initEngine(element);
  return window.coveoHeadless[engineId].engine;
}

/**
 * Initializes a component with Coveo Headless.
 * @param element The LightningElement component to initialize.
 * @param {String} engineId
 * @param {Function} initialize The component's initialization function.
 */
function initializeWithHeadless(element, engineId, initialize) {
  getHeadlessEngine(element, engineId).then((engine) => {
    initialize(engine);
    setComponentInitialized(element, engineId);
  }).catch((error) => {
    console.error('Fatal error: unable to initialize component', error);
  });
}

export {
  registerComponentForInit,
  setComponentInitialized,
  getHeadlessEngine,
  initializeWithHeadless,
}