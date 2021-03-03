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
 * @param {String} searchInterfaceId
 */
const cancelInitialSearch = (searchInterfaceId) => {
  if (debouncers[searchInterfaceId]) {
    debouncers[searchInterfaceId].clearTimeout();
    delete debouncers[searchInterfaceId];
  }
}

/**
 * Dispatches search request.
 * @param {String} searchInterfaceId
 */
const executeInitialSearch = (searchInterfaceId) => {
  window.coveoHeadless[searchInterfaceId].engine.then((engine) => {
    engine.dispatch(
      CoveoHeadless.SearchActions.executeSearch(
        CoveoHeadless.AnalyticsActions.logInterfaceLoad()
      )
    );
  });
};

/**
 * 
 * @param {String} searchInterfaceId 
 */
const debounceInitialSearch = (searchInterfaceId) => {
  if (!debouncers[searchInterfaceId]) {
    const debouncer = new Debouncer();
    debouncers.searchInterfaceId = debouncer;
  }
  debouncers.searchInterfaceId.debounce(executeInitialSearch, DEBOUNCE_DELAY)(searchInterfaceId);
};

/**
 * Returns true if registered components are initialized, false otherwise.
 * @param {String} searchInterfaceId
 */
const areAllComponentsInitialized = (searchInterfaceId) => 
  !window.coveoHeadless[searchInterfaceId].components.find(component => component.initialized === false);

/**
 * Returns the registered component object if it exists. 
 * @param element
 * @param {String} searchInterfaceId
 */
const getRegisteredComponent = (element, searchInterfaceId) => window.coveoHeadless[searchInterfaceId].components.find((component) => component.element === element);

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
 * @param {String} searchInterfaceId
 */
function registerComponentForInit(element, searchInterfaceId) {
  cancelInitialSearch(searchInterfaceId);
  if (!window.coveoHeadless) {
    window.coveoHeadless = {
      [searchInterfaceId]: {
        components: [],
        engine: undefined
      }
    }
  } else if (!window.coveoHeadless[searchInterfaceId]) {
    window.coveoHeadless[searchInterfaceId] = {
      components: [],
      engine: undefined
    }
  }
  const coveoHeadless = window.coveoHeadless[searchInterfaceId];

  if (!getRegisteredComponent(element, searchInterfaceId)) {
    coveoHeadless.components.push({
      element,
      initialized: false
    });
  }
}

/**
 * Sets registered component to initialized.
 * @param element
 * @param {String} searchInterfaceId
 */
function setComponentInitialized(element, searchInterfaceId) {
  const component = window.coveoHeadless
    && window.coveoHeadless[searchInterfaceId]
    ? getRegisteredComponent(element, searchInterfaceId)
    : undefined;

  if (!component) {
    throw new Error('Fatal Error: Component was not registered before initialization');
  }
  component.initialized = true;
  if (areAllComponentsInitialized(searchInterfaceId)) {
    debounceInitialSearch(searchInterfaceId);
  }
}

/**
 * Returns headless engine promise.
 * @param element The Lightning Element component with which to load dependencies.
 * @param {String} searchInterfaceId
 */
function getHeadlessEngine(element, searchInterfaceId) {
  if (window.coveoHeadless[searchInterfaceId] && window.coveoHeadless[searchInterfaceId].engine) {
    return window.coveoHeadless.engine;
  }
  window.coveoHeadless[searchInterfaceId].engine = initEngine(element);
  return window.coveoHeadless.engine;
}

/**
 * Initializes a component with Coveo Headless.
 * @param element The LightningElement component to initialize.
 * @param {String} searchInterfaceId
 * @param {Function} initialize The component's initialization function.
 */
function initializeWithHeadless(element, searchInterfaceId, initialize) {
  getHeadlessEngine(element, searchInterfaceId).then((engine) => {
    initialize(engine);
    setComponentInitialized(element, searchInterfaceId);
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