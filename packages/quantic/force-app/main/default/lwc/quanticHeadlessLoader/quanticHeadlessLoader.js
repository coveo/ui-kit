import componentInitializationError from '@salesforce/label/c.quantic_ComponentInitializationError';
import lookAtDeveloperConsole from '@salesforce/label/c.quantic_LookAtDeveloperConsole';
import unableToInitializeComponent from '@salesforce/label/c.quantic_UnableToInitializeComponent';
import BuenoPath from '@salesforce/resourceUrl/coveobueno';
import HeadlessPath from '@salesforce/resourceUrl/coveoheadless';
// @ts-ignore
import {Debouncer, Deferred, Store} from 'c/quanticUtils';
import {I18nUtils} from 'c/quanticUtils';
// @ts-ignore
import LightningAlert from 'lightning/alert';
// @ts-ignore
import {loadScript} from 'lightning/platformResourceLoader';

/** @typedef {import("coveo").SortCriterion} SortCriterion */

const DEBOUNCE_DELAY = 200;
let debouncers = {};
let dependencyPromises = [];
let componentErrorDisplayed = false;

const labels = {
  componentInitializationError,
  unableToInitializeComponent,
  lookAtDeveloperConsole,
};

const HeadlessBundleNames = {
  search: 'search',
  caseAssist: 'case-assist',
  insight: 'insight',
  recommendation: 'recommendation',
};

const headlessBundles = {
  [HeadlessBundleNames.search]: {
    libPath: '/headless.js',
    bundle: () => CoveoHeadless,
  },
  [HeadlessBundleNames.caseAssist]: {
    libPath: '/case-assist/headless.js',
    bundle: () => CoveoHeadlessCaseAssist,
  },
  [HeadlessBundleNames.insight]: {
    libPath: '/insight/headless.js',
    bundle: () => CoveoHeadlessInsight,
  },
  [HeadlessBundleNames.recommendation]: {
    libPath: '/recommendation/headless.js',
    bundle: () => CoveoHeadlessRecommendation,
  },
};

/**
 * Loads the Bueno library dependency.
 * @param element The Lightning element used to load the dependency.
 * @returns {Promise<void>} A promise that resolves when Bueno is available.
 */
const getBueno = (element) => {
  if (window.Bueno) {
    return Promise.resolve();
  }
  return loadScript(element, BuenoPath + '/browser/bueno.js');
};

/**
 * Loads the dependencies for an engine use case and returns its Headless bundle.
 * @param element The Lightning element used to load dependencies.
 * @param {string} [headlessUseCase=HeadlessBundleNames.search] The Headless use case whose bundle should be loaded.
 * @returns {Promise<AnyHeadless>} A promise that resolves to the loaded Headless bundle.
 * @throws {Error} If a dependency cannot be loaded.
 */
const loadDependencies = async (element, headlessUseCase) => {
  if (
    headlessUseCase &&
    !Object.prototype.hasOwnProperty.call(headlessBundles, headlessUseCase)
  ) {
    throw new Error(`Unsupported Headless use case: ${headlessUseCase}`);
  }

  const bundleInfo = headlessUseCase
    ? headlessBundles[headlessUseCase]
    : headlessBundles.search;

  dependencyPromises = [
    ...dependencyPromises,
    loadScript(element, HeadlessPath + bundleInfo.libPath),
    getBueno(element),
  ];
  await Promise.all(dependencyPromises);
  /** @type {AnyHeadless} */
  return bundleInfo.bundle();
};

/**
 * Registers the callback to run after all components for an engine are initialized.
 * @param {Function} callback The callback to invoke with the initialized engine.
 * @param {string} engineId The ID of the engine.
 */
const setInitializedCallback = (callback, engineId) => {
  const engine = window.coveoHeadless?.[engineId];
  if (!engine) {
    throw new Error(
      `Engine has not been registered for engine ID: ${engineId}`
    );
  }
  engine.initializedCallback = callback;
};

/**
 * Cancels the delayed search query.
 * @param {string} engineId The ID of the engine.
 */
const cancelInitializedCallback = (engineId) => {
  if (debouncers[engineId]) {
    debouncers[engineId].clearTimeout();
    delete debouncers[engineId];
  }
};

/**
 * Executes the initialization callback with the engine once the debounce delay expires.
 * @param {string} engineId The ID of the engine.
 * @returns {Promise<void>}
 */
const executeInitializedCallback = async (engineId) => {
  const engine = window.coveoHeadless?.[engineId];
  if (!engine?.initializedCallback) {
    return;
  }

  try {
    await engine.initializedCallback(await engine.enginePromise);
  } catch (error) {
    console.error(
      `Fatal error: unable to execute the initialization callback for engine ID: ${engineId}`,
      error
    );
    throw new Error(
      `Fatal error: unable to execute the initialization callback for engine ID: ${engineId}`,
      {cause: error}
    );
  }
};

/**
 * Schedules the engine's initialization callback after a short debounce period.
 * @param {string} engineId The ID of the engine.
 */
const debounceInitializedCallback = (engineId) => {
  if (!debouncers[engineId]) {
    debouncers[engineId] = new Debouncer();
  }
  debouncers[engineId].debounce(
    executeInitializedCallback,
    DEBOUNCE_DELAY
  )(engineId);
};

/**
 * Checks whether every component registered for an engine has initialized.
 * @param {string} engineId The ID of the engine.
 * @returns {boolean}
 */
const areAllComponentsInitialized = (engineId) =>
  window.coveoHeadless?.[engineId]?.components?.every(
    (component) => component.initialized === true
  ) ?? false;

/**
 * Finds a component registered for an engine.
 * @param element The component to find.
 * @param {string} engineId The ID of the engine.
 * @returns {Object | undefined} The registered component, if found.
 */
const getRegisteredComponent = (element, engineId) =>
  window.coveoHeadless?.[engineId]?.components?.find(
    (component) => component.element === element
  );

/**
 * Instantiates the coveoHeadless window object and the engine attribute for the provided ID.
 * @param element The Lightning element associated with the engine.
 * @param {string} engineId The ID of the engine.
 */
const instantiateWindowEngineObject = (element, engineId) => {
  const newWindowEngineObject = {
    components: [],
    enginePromise: undefined,
    options: new Deferred(),
    bindings: {},
    bundle: undefined,
  };
  if (!window.coveoHeadless) {
    window.coveoHeadless = {
      [engineId]: newWindowEngineObject,
    };
  } else if (!window.coveoHeadless[engineId]) {
    window.coveoHeadless[engineId] = newWindowEngineObject;
  }
};

/**
 * Creates and returns the Headless engine for an engine ID.
 * @param {string} engineId The ID of the engine.
 * @returns {Promise<AnyHeadless>} A promise that resolves to the initialized Headless engine.
 * @throws {Error} If the engine state or options is invalid, or engine construction fails.
 */
async function initEngine(engineId) {
  try {
    const engineState = window.coveoHeadless?.[engineId];
    if (!engineState) {
      throw new Error(
        `Engine has not been registered for engine ID: ${engineId}`
      );
    }
    if (engineState.bindings.engine) {
      throw new Error(`Engine already instantiated for engine ID: ${engineId}`);
    }
    if (!engineState.options) {
      throw new Error('Engine options have not been set.');
    }

    const options = await engineState.options.promise;
    return engineState.engineConstructor(options);
  } catch (error) {
    throw new Error('Fatal error: unable to initialize Coveo Headless', {
      cause: error,
    });
  }
}

/**
 * Initializes the Quantic store for an engine when one is not already available.
 * @param {string} engineId The ID of the engine.
 * @throws {Error} If the engine state cannot be accessed or the store cannot be initialized.
 */
const initQuanticStore = (engineId) => {
  try {
    const engineState = window.coveoHeadless?.[engineId];
    if (!engineState) {
      throw new Error(
        `Engine has not been registered for engine ID: ${engineId}`
      );
    }
    if (!engineState.bindings.store) {
      engineState.bindings.store = Store.initialize();
    }
  } catch (error) {
    throw new Error('Fatal error: unable to initialize Quantic store', {
      cause: error,
    });
  }
};

/**
 * Sets the options passed to engine constructor for given engine ID.
 * @param options The Headless options for the specified engine ID.
 * @param {(options: unknown) => unknown} engineConstructor The Headless engine constructor.
 * @param {string} engineId The ID of the engine.
 * @param element The Lightning element to use to load dependencies.
 * @param headlessBundle The Headless bundle associated with the engine.
 */
function setEngineOptions(
  options,
  engineConstructor,
  engineId,
  element,
  headlessBundle
) {
  if (window.coveoHeadless?.[engineId]?.options?.isResolved) {
    console.warn(
      `Attempted to overwrite engine options for engine ID: ${engineId}`
    );
    return;
  }
  if (!window.coveoHeadless?.[engineId]) {
    instantiateWindowEngineObject(element, engineId);
  }
  window.coveoHeadless[engineId].engineConstructor = engineConstructor;
  window.coveoHeadless[engineId].bundle = headlessBundle;
  window.coveoHeadless[engineId].options.resolve(options);
}

/**
 * Registers a component for future initialization.
 * @param element The Lightning element to use to load dependencies.
 * @param {string} engineId The ID of the engine.
 */
function registerComponentForInit(element, engineId) {
  cancelInitializedCallback(engineId);

  instantiateWindowEngineObject(element, engineId);

  if (!getRegisteredComponent(element, engineId)) {
    window.coveoHeadless[engineId].components.push({
      element,
      initialized: false,
    });
  }
}

/**
 * Sets registered component to initialized.
 * @param element The Lightning element to use to load dependencies.
 * @param {string} engineId The ID of the engine.
 * @throws {Error} If the component was not registered for the engine.
 */
function setComponentInitialized(element, engineId) {
  const component = window.coveoHeadless?.[engineId]
    ? getRegisteredComponent(element, engineId)
    : undefined;

  if (!component) {
    throw new Error(
      'Fatal Error: Component was not registered before initialization'
    );
  }
  component.initialized = true;
  if (
    window.coveoHeadless[engineId].initializedCallback &&
    areAllComponentsInitialized(engineId)
  ) {
    debounceInitializedCallback(engineId);
  }
}

/**
 * Returns headless engine promise.
 * @param {string} engineId The ID of the engine.
 * @returns {Promise<AnyHeadless>} A promise that resolves to the Headless engine.
 * @throws {Error} If engine initialization fails.
 */
function getHeadlessEnginePromise(engineId) {
  const engineState = window.coveoHeadless?.[engineId];
  if (!engineState) {
    throw new Error(
      `Engine has not been registered for engine ID: ${engineId}`
    );
  }
  if (!engineState.enginePromise) {
    engineState.enginePromise = initEngine(engineId).then((engine) => {
      engineState.bindings.engine = engine;
      return engine;
    });
  }
  return engineState.enginePromise;
}

/**
 * Returns bindings object for specified engineId.
 * @param {string} engineId The ID of the engine.
 * @returns {Object | undefined} The engine bindings, if registered.
 */
function getHeadlessBindings(engineId) {
  return window.coveoHeadless?.[engineId]?.bindings;
}

/**
 * Returns the Quantic store associated with an engine.
 * @param {string} engineId The ID of the engine.
 * @returns {Object | undefined} The store, if initialized.
 */
function getQuanticStore(engineId) {
  return window.coveoHeadless?.[engineId]?.bindings?.store;
}

/**
 * Initializes a component with Coveo Headless.
 * Failures while initializing the Quantic store, Headless engine, or component
 * callback are logged and reported through the component error UI.
 * @param element The component to initialize.
 * @param {string} engineId The ID of the engine.
 * @param {Function} initialize The component initialization callback function.
 * @returns {Promise<void>} A promise that resolves after initialization handling completes.
 * @throws {Error} If the component was not registered before initialization.
 */
async function initializeWithHeadless(element, engineId, initialize) {
  const component = getRegisteredComponent(element, engineId);
  if (!component) {
    throw new Error(
      'Fatal Error: Component was not registered before initialization'
    );
  }
  if (component.initialized) {
    return;
  }
  try {
    initQuanticStore(engineId);
    initialize(await getHeadlessEnginePromise(engineId));
  } catch (error) {
    console.error(
      `Fatal error: unable to initialize ${element?.template?.host?.localName} component.`,
      error
    );
    element?.setInitializationError?.();
    if (!componentErrorDisplayed) {
      componentErrorDisplayed = true;
      await LightningAlert.open({
        message: `${I18nUtils.format(
          labels.unableToInitializeComponent,
          element?.template?.host?.localName
        )} ${labels.lookAtDeveloperConsole}`,
        theme: 'error',
        label: labels.componentInitializationError,
      });
    }
  } finally {
    setComponentInitialized(element, engineId);
  }
}

/**
 * Removes the headless engine instance from the window object.
 * @param {string} engineId The ID of the engine to remove.
 */
function destroyEngine(engineId) {
  if (window.coveoHeadless?.[engineId]) {
    delete window.coveoHeadless[engineId];
  }
}

/**
 * Registers facet data in the engine's store.
 * @param {string} engineId The ID of the engine.
 * @param {string} facetType The store facet collection to update.
 * @param {{label: string, facetId: string, format?: Function, element?: HTMLElement, metadata?: object}} data The facet data to register.
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
 * Registers sort options in the engine's store.
 * @param {string} engineId The ID of the engine.
 * @param {Array<{label: string, value: string, criterion: SortCriterion}>} data The sort options to register.
 */
function registerSortOptionsToStore(engineId, data) {
  const store = getQuanticStore(engineId);
  try {
    Store.registerSortOptionDataToStore(store, data);
  } catch (error) {
    console.error('Fatal error: unable to register in store', error);
  }
}

/**
 * Gets facet data from the engine's store.
 * @param {string} engineId The ID of the engine.
 * @param {string} facetType The store facet collection to read.
 * @returns {Object | undefined} The facet data, if available.
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
 * Gets all facet data from the engine's store.
 * @param {string} engineId The ID of the engine.
 * @returns {Object} All available facet data grouped by facet type.
 */
function getAllFacetsFromStore(engineId) {
  return Object.values(Store.facetTypes).reduce(
    (allFacets, facetType) => ({
      ...allFacets,
      ...getFromStore(engineId, facetType),
    }),
    {}
  );
}

/**
 * Gets all sort option data from the engine's store.
 * @param {string} engineId The ID of the engine.
 * @returns {Array<{label: string, value: string, criterion: SortCriterion}> | undefined} The sort options, if available.
 */
function getAllSortOptionsFromStore(engineId) {
  const store = getQuanticStore(engineId);
  try {
    return Store.getSortOptionsFromStore(store);
  } catch (error) {
    console.error('Fatal error: unable to get data from store', error);
    return undefined;
  }
}

/**
 * Gets the Headless bundle associated with an engine.
 * @param {string} engineId The ID of the engine.
 * @returns {AnyHeadless} The configured Headless bundle, or the default search bundle.
 */
function getHeadlessBundle(engineId) {
  return window.coveoHeadless?.[engineId]?.bundle ?? CoveoHeadless;
}

/**
 * Checks whether an engine uses the expected Headless bundle.
 * @param {string} engineId The ID of the engine.
 * @param {string} expectedBundleName The name of the expected Headless bundle.
 * @returns {boolean} Whether the engine uses the expected bundle.
 */
function isHeadlessBundle(engineId, expectedBundleName) {
  let expectedBundle;
  try {
    expectedBundle = headlessBundles[expectedBundleName]?.bundle();
  } catch (e) {
    // Attempting to load a bundle for a different case will fail
    // unless both bundles are loaded at the same time.
  }

  return getHeadlessBundle(engineId) === expectedBundle;
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
  registerSortOptionsToStore,
  getAllSortOptionsFromStore,
  HeadlessBundleNames,
  getAllFacetsFromStore,
  getHeadlessBundle,
  isHeadlessBundle,
  getBueno,
};
