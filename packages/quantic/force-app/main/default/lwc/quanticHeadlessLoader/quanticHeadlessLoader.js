import HeadlessPath from '@salesforce/resourceUrl/coveoheadless';
// @ts-ignore
import {loadScript} from 'lightning/platformResourceLoader';
// @ts-ignore
import {Debouncer, Deferred} from 'c/quanticUtils';

const DEBOUNCE_DELAY = 200;
let debouncers = {};
let dependencyPromises = [];

/**
 * Initiates dependency loading promises.
 * @param element The Lightning element to use to load dependencies.
 */
const loadDependencies = (element) => {
  dependencyPromises = [
    loadScript(element, HeadlessPath + '/browser/headless.js'),
  ]
}

/**
 * Cancels the delayed search query.
 * @param {string} engineId The id of the engine. 
 */
const cancelInitialSearch = (engineId) => {
  if (debouncers[engineId]) {
    debouncers[engineId].clearTimeout();
    delete debouncers[engineId];
  }
}

/**
 * Dispatches search request.
 * @param {string} engineId The id of the engine. 
 */
const executeInitialSearch = (engineId) => {
  window.coveoHeadless[engineId].engine.then((engine) => {
    engine.executeFirstSearch();
  });
};

/**
 * Starts the debounced initial search request.
 * @param {string} engineId The id of the engine. 
 */
const debounceInitialSearch = (engineId) => {
  if (!debouncers[engineId]) {
    debouncers[engineId] = new Debouncer();
  }
  debouncers[engineId].debounce(executeInitialSearch, DEBOUNCE_DELAY)(engineId);
};

/**
 * Returns true if registered components are initialized, false otherwise.
 * @param {string} engineId The id of the engine.
 */
const areAllComponentsInitialized = (engineId) =>
  !window.coveoHeadless[engineId].components.find(component => component.initialized === false);

/**
 * Returns the registered component object if it exists.
 * @param element The Lightning Element component with which to load dependencies.
 * @param {string} engineId The id of the engine.
 */
const getRegisteredComponent = (element, engineId) => window.coveoHeadless[engineId].components.find((component) => component.element === element);

/**
 * Instantiates the coveoHeadless window object and the engine attribute for the provided ID.
 * @param element The Lightning element to use to load dependencies.
 * @param {string} engineId The id of the engine.
 */
const instantiateWindowEngineObject = (element, engineId) => {
  if (!window.coveoHeadless) {
    loadDependencies(element);
    window.coveoHeadless = {
      [engineId]: {
        components: [],
        engine: undefined,
        config: new Deferred()
      }
    }
  } else if(!window.coveoHeadless[engineId]) {
    window.coveoHeadless[engineId] = {
      components: [],
      engine: undefined,
      config: new Deferred()
    }
  }
}

/**
 * Loads dependencies and returns an initialized Headless engine. 
 * @param {string} engineId The id of the engine.
 */
async function initEngine(engineId) {
  try {
    if (dependencyPromises.length === 0) {
      throw new Error('Dependencies were never requested.');
    }
    await Promise.all(dependencyPromises);

    if (!window.coveoHeadless[engineId].config) {
      throw new Error('Engine configuration has not been set.');
    }
    const configuration = await window.coveoHeadless[engineId].config.promise;
    return CoveoHeadless.buildSearchEngine({configuration})
  } catch (error) {
    throw new Error('Fatal error: unable to initialize Coveo Headless: ' + error);
  }
}

/**
 * 
 * @param {import("coveo").HeadlessConfigurationOptions} config The Headless configuration options for the specified engine ID.
 * @param {string} engineId The id of the engine.
 * @param element The Lightning element to use to load dependencies.
 */
function setEngineConfiguration(config, engineId, element) {
  if (window.coveoHeadless && window.coveoHeadless[engineId] && window.coveoHeadless[engineId].config.isResolved) {
    throw new Error(`Attempted to overwrite configuration for engine: ${engineId}`);
  }
  if (!(window.coveoHeadless && window.coveoHeadless[engineId])) {
    instantiateWindowEngineObject(element, engineId)
  }
  window.coveoHeadless[engineId].config.resolve(config);
}

/**
 * Registers a component for future initialization.
 * @param element The Lightning element to use to load dependencies.
 * @param {string} engineId The id of the engine.
 */
function registerComponentForInit(element, engineId) {
  cancelInitialSearch(engineId);

  instantiateWindowEngineObject(element, engineId);

  if (!getRegisteredComponent(element, engineId)) {
    window.coveoHeadless[engineId].components.push({
      element,
      initialized: false
    });
  }
}

/**
 * Sets registered component to initialized.
 * @param element The Lightning element to use to load dependencies.
 * @param {string} engineId The id of the engine.
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
 * @param {string} engineId The id of the engine.
 */
async function getHeadlessEngine(engineId) {
  if (!window.coveoHeadless[engineId].engine) {
    window.coveoHeadless[engineId].engine = initEngine(engineId);
  }
  return window.coveoHeadless[engineId].engine;
}

/**
 * Initializes a component with Coveo Headless.
 * @param element The LightningElement component to initialize.
 * @param {string} engineId The id of the engine.
 * @param {Function} initialize The component's initialization function.
 */
async function initializeWithHeadless(element, engineId, initialize) {
  if (getRegisteredComponent(element, engineId).initialized) {
    return;
  }
  try {
    initialize(await getHeadlessEngine(engineId));
    setComponentInitialized(element, engineId);
  } catch (error) {
    console.error('Fatal error: unable to initialize component', error);
  }
}

export {
  setEngineConfiguration,
  registerComponentForInit,
  setComponentInitialized,
  getHeadlessEngine,
  initializeWithHeadless,
}