import HeadlessPath from '@salesforce/resourceUrl/coveoheadless';
import AtomicPath from '@salesforce/resourceUrl/atomicutils';
// @ts-ignore	
import { loadScript } from 'lightning/platformResourceLoader';
// @ts-ignore	
import { Debouncer } from 'c/utils';

const DEBOUNCE_DELAY = 200;
let debouncers = {};
let dependencyPromises = [];

const loadDependencies = (element) => {
  dependencyPromises = [
    loadScript(element, HeadlessPath + '/browser/headless.js'),
    loadScript(element, AtomicPath + '/atomic-utils.js')
  ]
}

/**
 * Cancels the delayed search query.
 * @param {String} engineId The id of the engine. 
 */
const cancelInitialSearch = (engineId) => {
  if (debouncers[engineId]) {
    debouncers[engineId].clearTimeout();
    delete debouncers[engineId];
  }
}

/**
 * Dispatches search request.
 * @param {String} engineId The id of the engine. 
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
 * Starts the debounced initial search request.
 * @param {String} engineId The id of the engine. 
 */
const debounceInitialSearch = (engineId) => {
  if (!debouncers[engineId]) {
    debouncers[engineId] = new Debouncer();
  }
  debouncers[engineId].debounce(executeInitialSearch, DEBOUNCE_DELAY)(engineId);
};

/**
 * Returns true if registered components are initialized, false otherwise.
 * @param {String} engineId The id of the engine.
 */
const areAllComponentsInitialized = (engineId) => 
  !window.coveoHeadless[engineId].components.find(component => component.initialized === false);

/**
 * Returns the registered component object if it exists.
 * @param element The Lightning Element component with which to load dependencies.
 * @param {String} engineId The id of the engine.
 */
const getRegisteredComponent = (element, engineId) => window.coveoHeadless[engineId].components.find((component) => component.element === element);

/**
 * Loads dependencies and returns an initialized Headless engine. 
 */
async function initEngine() {
  let engine;
  try {
    if (dependencyPromises.length === 0) {
      throw new Error('Dependencies were never requested.');
    }
    await Promise.all(dependencyPromises);
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
 * @param element The Lightning Element component with which to load dependencies.
 * @param {String} engineId The id of the engine.
 */
function registerComponentForInit(element, engineId) {
  cancelInitialSearch(engineId);
  if (!window.coveoHeadless) {
    loadDependencies(element);
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
 * @param element The Lightning Element component with which to load dependencies.
 * @param {String} engineId The id of the engine.
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
 * @param {String} engineId The id of the engine.
 */
function getHeadlessEngine(engineId) {
  if (window.coveoHeadless[engineId] && window.coveoHeadless[engineId].engine) {
    return window.coveoHeadless[engineId].engine;
  }
  window.coveoHeadless[engineId].engine = initEngine();
  return window.coveoHeadless[engineId].engine;
}

/**
 * Initializes a component with Coveo Headless.
 * @param element The LightningElement component to initialize.
 * @param {String} engineId The id of the engine.
 * @param {Function} initialize The component's initialization function.
 */
function initializeWithHeadless(element, engineId, initialize) {
  if (getRegisteredComponent(element, engineId).initialized) {
    return;
  }
  getHeadlessEngine(engineId).then((engine) => {
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