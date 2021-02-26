import HeadlessPath from '@salesforce/resourceUrl/coveoheadless';
import AtomicPath from '@salesforce/resourceUrl/atomicutils';
// @ts-ignore
import { loadScript } from 'lightning/platformResourceLoader';

let timeout;
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

const cancelInitialSearch = () => {
  if (timeout) {
    console.log('canceled search')
    clearTimeout(timeout);
    timeout = undefined;
  }
}

const executeInitialSearch = debounce(() => {
  window.coveoHeadless.engine.dispatch(
    CoveoHeadless.SearchActions.executeSearch(
      CoveoHeadless.AnalyticsActions.logInterfaceLoad()
    )
  );
  console.log('Executed initial search')
}, 1000); //TODO: determine if debounce needed and how much

const getAreComponentsReady = () => {
  return !window.coveoHeadless.components.find(component => component.initialized === false)
}

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
      element: element,
      initialized: false
    });
  }
}

function setComponentInitialized(element) {
  const component = window.coveoHeadless.components.find((comp) => comp.element === element);
  if (!component) {
    console.log('Fatal Error: Component was not registered before initialization.');
    return;
  }
  component.initialized = true;
  if (getAreComponentsReady()) {
    executeInitialSearch();
  }
}

function getHeadlessEngine(element) {
  if (!window.coveoHeadless.engine) {
    try {
      window.coveoHeadless.engine = initEngine(element);
      window.coveoHeadless.engine.then((engine) => {
        window.coveoHeadless.engine = engine
      })
    } catch (error) {
      console.error('Fatal error: unable to initialize Coveo Headless', error);
    }
  }
  return Promise.resolve(window.coveoHeadless.engine);
}

async function initEngine(element) {
  await loadScript(element, HeadlessPath + '/browser/headless.js');
  await loadScript(element, AtomicPath + '/atomic-utils.js');

  const config = CoveoHeadless.HeadlessEngine.getSampleConfiguration();

  const engine = new CoveoHeadless.HeadlessEngine({
    configuration: config,
    reducers: CoveoHeadless.searchAppReducers,
  });

  return engine;
}

export {
  getHeadlessEngine,
  initEngine,
  registerComponentForInit,
  setComponentInitialized,
}