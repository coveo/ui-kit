import HeadlessPath from '@salesforce/resourceUrl/coveoheadless';
import AtomicPath from '@salesforce/resourceUrl/atomicutils';
import { loadScript } from 'lightning/platformResourceLoader';

const DEBOUNCE_DELAY = 200;
let timeout;

/**
 * Debounces a function execution.
 * @param {Function} func The function for which to delay execution.
 * @param {Number} wait The time to delay in milliseconds.
 */
const debounce = (func, wait) => {
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    timeout = setTimeout(later, wait);
  };
};

/**
 * Cancels the delayed search query.
 */
const cancelInitialSearch = () => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = undefined;
  }
}

/**
 * Dispatches search request.
 */
const executeInitialSearch = debounce(() => {
  window.coveoHeadless.engine.dispatch(
    CoveoHeadless.SearchActions.executeSearch(
      CoveoHeadless.AnalyticsActions.logInterfaceLoad()
    )
  );
}, DEBOUNCE_DELAY);

/**
 * Returns true if registered components are initialized, false otherwise.
 */
const getAreComponentsReady = () => !window.coveoHeadless.components.find(component => component.initialized === false);

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
    console.error('Fatal error: unable to initialize Coveo Headless', error);
  }
  return engine;
}

/**
 * Registers a component for future initialization.
 * @param element 
 */
function registerComponentForInit(element) {
  cancelInitialSearch();
  if (!window.coveoHeadless) {
    window.coveoHeadless = {
      components: [],
      engine: undefined
    }
  }
  const isComponentRegistered = window.coveoHeadless.components.find((component) => component.element === element)
  if (!isComponentRegistered) {
    window.coveoHeadless.components.push({
      element,
      initialized: false
    });
  }
}

/**
 * Sets registered component to initialized.
 * @param element 
 */
function setComponentInitialized(element) {
  const component = window.coveoHeadless ? window.coveoHeadless.components.find((comp) => comp.element === element) : undefined;
  if (!component) {
    throw new Error('Fatal Error: Component was not registered before initialization');
  }
  component.initialized = true;
  if (getAreComponentsReady()) {
    executeInitialSearch();
  }
}

/**
 * Returns headless engine promise.
 * @param element The Lightning Element component with which to load dependencies.
 */
function getHeadlessEngine(element) {
  if (window.coveoHeadless.engine) {
    return Promise.resolve(window.coveoHeadless.engine);
  } 
  window.coveoHeadless.engine = initEngine(element);
  window.coveoHeadless.engine.then((engine) => {
    window.coveoHeadless.engine = engine;
  });
  return window.coveoHeadless.engine;
}

/**
 * Initializes a component with Coveo Headless.
 * @param element The LightningElement component to initialize.
 * @param {Function} initialize The component's initialization function.
 */
function initializeWithHeadless(element, initialize) {
  getHeadlessEngine(element).then((engine) => {
    initialize(engine);
    setComponentInitialized(element);
  }).catch((error) => {
    console.error('Fatal error: unable to initialize component', error);
  });
}

export {
  executeInitialSearch,
  registerComponentForInit,
  setComponentInitialized,
  getHeadlessEngine,
  initializeWithHeadless,
}