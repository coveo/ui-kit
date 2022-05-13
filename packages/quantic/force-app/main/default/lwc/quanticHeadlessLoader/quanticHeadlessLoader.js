import HeadlessPath from '@salesforce/resourceUrl/coveoheadless';
// @ts-ignore
import {loadScript} from 'lightning/platformResourceLoader';
// @ts-ignore
import {Debouncer, Deferred, Store} from 'c/quanticUtils';

const DEBOUNCE_DELAY = 200;
let debouncers = {};
let dependencyPromises = [];

const HeadlessBundleNames = {
  search: 'search',
  caseAssist: 'case-assist'
};

const headlessBundles = {
  [HeadlessBundleNames.search]: {
    libPath: '/browser/headless.js',
    bundle: () => CoveoHeadless,
  },
  [HeadlessBundleNames.caseAssist]: {
    libPath: '/browser/case-assist/headless.js',
    bundle: () => CoveoHeadlessCaseAssist,
  },
};

/**
 * Initiates dependency loading promises.
 * @param element The Lightning element to use to load dependencies.
 */
const loadDependencies = async (element, headlessUseCase) => {
  const bundleInfo = headlessUseCase ? headlessBundles[headlessUseCase] : headlessBundles.search;

  dependencyPromises = [
    ...dependencyPromises,
    loadScript(element, HeadlessPath + bundleInfo.libPath),
  ];
    
  await Promise.all(dependencyPromises);
  return bundleInfo.bundle();
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
  const newWindowEngineObject = {
    components: [],
    enginePromise: undefined,
    options: new Deferred(),
    bindings: {},
  };
  if (!window.coveoHeadless) {
    window.coveoHeadless = {
      [engineId]: newWindowEngineObject
    }
  } else if (!window.coveoHeadless[engineId]) {
    window.coveoHeadless[engineId] = newWindowEngineObject;
  }
}

/**
 * Loads dependencies and returns an initialized Headless engine. 
 * @param {string} engineId The id of the engine.
 */
async function initEngine(engineId) {
  try {
    if (window.coveoHeadless[engineId].bindings.engine) {
      throw new Error(`Engine already instantiated for engine ID: ${engineId}`);
    }
    if (!window.coveoHeadless[engineId].options) {
      throw new Error('Engine options have not been set.');
    }

    const options = await window.coveoHeadless[engineId].options.promise;
    return window.coveoHeadless[engineId].engineConstructor(options);
  } catch (error) {
    throw new Error('Fatal error: unable to initialize Coveo Headless: ' + error);
  }
}

/**
 * Initialize coveoHeadless Store object 
 * @param {string} engineId The ID of the engine.
 */
const initQuanticStore = (engineId) => {
  try {
     if(!window.coveoHeadless[engineId].bindings.store) {
       window.coveoHeadless[engineId].bindings.store = Store.initialize();
     }
  } catch (error) {
    throw new Error('Fatal error: unable to initialize Quantic store: ' + error);
  }
}

/**
 * Sets the options passed to engine constructor for given engine ID.
 * @param options The Headless options for the specified engine ID.
 * @param {(options: unknown) => unknown} engineConstructor Th engine constructor.
 * @param {string} engineId The id of the engine.
 * @param element The Lightning element to use to load dependencies.
 */
function setEngineOptions(options, engineConstructor, engineId, element) {
  if (window.coveoHeadless?.[engineId]?.options?.isResolved) {
    console.warn(`Attempted to overwrite engine options for engine ID: ${engineId}`);
    return;
  }
  if (!window.coveoHeadless?.[engineId]) {
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
  const component = window.coveoHeadless?.[engineId]
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
  return window.coveoHeadless?.[engineId]?.bindings;
}

/**
 * Returns store object for specified engineId.
 * @param {string} engineId The engine ID.
 */
function getQuanticStore(engineId) {
 return window.coveoHeadless?.[engineId]?.bindings?.store;
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
    initQuanticStore(engineId);
    initialize(await getHeadlessEnginePromise(engineId));
    setComponentInitialized(element, engineId);
  } catch (error) {
    console.error('Fatal error: unable to initialize component', error);
  }
}

/**
 * Removed the headless engine instance from the window object.
 * @param {string} engineId 
 */
function destroyEngine(engineId) {
  if (window.coveoHeadless?.[engineId]) {
    delete window.coveoHeadless[engineId];
  }
}

/**
 * Register a facet in the store.
 * @param {string} engineId The engine ID.
 * @param {string} facetType
 * @param {{ label: string; facetId: string; format?: function, element?: HTMLElement}} data
 */
function registerToStore(engineId, facetType, data) {
  const store = getQuanticStore(engineId);
  try {
    Store.registerFacetToStore(store, facetType, data);
  } catch (error) {
    console.error('Fatal error: unable to register in store', error);
  }
}

/**
 * Get facet data from store.
 * @param {string} engineId The engine ID.
 * @param {string} facetType
 */
function getFromStore(engineId, facetType) {
  const store = getQuanticStore(engineId);
  try {
    return Store.getFromStore(store, facetType);
  } catch (error) {
    console.error('Fatal error: unable to get data from store', error);
    return undefined;
  }
}

/**
 * Get all facet data from store.
 * @param {string} engineId The engine ID.
 */
 function getAllFacetsFromStore(engineId) {
  return Object.values(Store.facetTypes).reduce((allFacets, facetType) => ({
    ...allFacets, ...getFromStore(engineId, facetType)
  }), {})
}


export {
  loadDependencies,
  setInitializedCallback,
  setEngineOptions,
  registerComponentForInit,
  setComponentInitialized,
  getHeadlessEnginePromise,
  getHeadlessBindings,
  initializeWithHeadless,
  destroyEngine,
  registerToStore,
  getFromStore,
  HeadlessBundleNames,
  getAllFacetsFromStore,
}