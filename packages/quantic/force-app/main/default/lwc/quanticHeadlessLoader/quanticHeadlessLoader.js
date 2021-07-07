import HeadlessPath from '@salesforce/resourceUrl/coveoheadless';
// @ts-ignore
import { loadScript } from 'lightning/platformResourceLoader';
// @ts-ignore
import { Debouncer, Deferred } from 'c/quanticUtils';

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
 * Sets callback to execute when all components are registered with the specified engine.
 * @param {Function} callback 
 * @param {string} engineId 
 */
const setInitializedCallback = (callback, engineId) => {
  window.coveoHeadless[engineId].initializedCallback = callback;
}

/**
 * Cancels the delayed search query.
 * @param {string} engineId The id of the engine.
 */
const cancelInitializedCallback = (engineId) => {
  if (debouncers[engineId]) {
    debouncers[engineId].clearTimeout();
    delete debouncers[engineId];
  }
}

/**
 * Dispatches search request.
 * @param {string} engineId The id of the engine. 
 */
const executeInitializedCallback = async (engineId) => {
  window.coveoHeadless[engineId].initializedCallback(await window.coveoHeadless[engineId].enginePromise);
};

/**
 * Starts the debounced initial search request.
 * @param {string} engineId The id of the engine. 
 */
const debounceInitializedCallback = (engineId) => {
  if (!debouncers[engineId]) {
    debouncers[engineId] = new Debouncer();
  }
  debouncers[engineId].debounce(executeInitializedCallback, DEBOUNCE_DELAY)(engineId);
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
  const newObject = {
    components: [],
    enginePromise: undefined,
    options: new Deferred(),
    bindings: {},
  };
  if (!window.coveoHeadless) {
    loadDependencies(element);
    window.coveoHeadless = {
      [engineId]: newObject
    }
  } else if (!window.coveoHeadless[engineId]) {
    window.coveoHeadless[engineId] = newObject;
  }
}

/**
 * Loads dependencies and returns an initialized Headless engine. 
 * @param {string} engineId The id of the engine.
 */
async function initEngine(engineId) {
  try {
    if(window.coveoHeadless[engineId].bindings.engine) {
      throw new Error(`Engine already instantiated for engine ID: ${engineId}`);
    }
    if (!window.coveoHeadless[engineId].options) {
      throw new Error('Engine options have not been set.');
    }
    if (dependencyPromises.length === 0) {
      throw new Error('Dependencies were never requested.');
    }
    await Promise.all(dependencyPromises);

    const options = await window.coveoHeadless[engineId].options.promise;
    return window.coveoHeadless[engineId].engineConstructor(options);
  } catch (error) {
    throw new Error('Fatal error: unable to initialize Coveo Headless: ' + error);
  }
}

/**
 * Sets the options passed to engine constructor for given engine ID.
 * @param options The Headless options for the specified engine ID.
 * @param {string} engineId The id of the engine.
 * @param element The Lightning element to use to load dependencies.
 */
function setEngineOptions(options, engineConstructor, engineId, element) {
  if (window.coveoHeadless && window.coveoHeadless[engineId] && window.coveoHeadless[engineId].options.isResolved) {
    console.warn(`Attempted to overwrite engine options for engine ID: ${engineId}`);
    return;
  }
  if (!(window.coveoHeadless && window.coveoHeadless[engineId])) {
    instantiateWindowEngineObject(element, engineId)
  }
  window.coveoHeadless[engineId].engineConstructor = engineConstructor;
  window.coveoHeadless[engineId].options.resolve(options);
}

/**
 * Registers a component for future initialization.
 * @param element The Lightning element to use to load dependencies.
 * @param {string} engineId The id of the engine.
 */
function registerComponentForInit(element, engineId) {
  cancelInitializedCallback(engineId);

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
  if (window.coveoHeadless[engineId].initializedCallback && areAllComponentsInitialized(engineId)) {
    debounceInitializedCallback(engineId);
  }
}

/**
 * Returns headless engine promise.
 * @param {string} engineId The id of the engine.
 */
function getHeadlessEnginePromise(engineId) {
  if (!window.coveoHeadless[engineId].enginePromise) {
    window.coveoHeadless[engineId].enginePromise = initEngine(engineId).then((engine) => {
      window.coveoHeadless[engineId].bindings.engine = engine
      return engine;
    });
  }
  return window.coveoHeadless[engineId].enginePromise;
}

/**
 * Returns bindings object for specified engineId.
 * @param {string} engineId The id of the engine.
 */
function getHeadlessBindings(engineId) {
  return {
    engine: window.coveoHeadless[engineId].bindings,
  }
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
    initialize(await getHeadlessEnginePromise(engineId));
    setComponentInitialized(element, engineId);
  } catch (error) {
    console.error('Fatal error: unable to initialize component', error);
  }
}

export {
  setInitializedCallback,
  setEngineOptions,
  registerComponentForInit,
  setComponentInitialized,
  getHeadlessEnginePromise,
  getHeadlessBindings,
  initializeWithHeadless,
}