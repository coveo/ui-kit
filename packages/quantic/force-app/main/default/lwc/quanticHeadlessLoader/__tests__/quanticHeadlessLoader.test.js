/* eslint-disable jest/expect-expect */
import {
  setInitializedCallback,
  setEngineConfiguration,
  registerComponentForInit,
  setComponentInitialized,
  getHeadlessEngine,
  initializeWithHeadless
} from '../quanticHeadlessLoader';
import { CoveoHeadlessStub } from '../../testUtils/coveoHeadlessStub';
import {Deferred} from '../../quanticUtils/quanticUtils';

describe('c/quanticHeadlessLoader', () => {
  const testOptions = {
    organizationId: 'testOrganization',
    accessToken: 'bogus-token-xxxxx-xxxxx',
    search: {
      pipeline: 'default',
      searchHub: 'default',
    }
  };

  let resolvedTestOptions;
  let mockedConsoleError;
  let initialize;
  let testId = 'search-page-1';

  let testElement;

  const createComponentEntryWithInitStatus = (isInitialized) => ({
    element: document.createElement('div'),
    initialized: isInitialized
  });

  const assertComponentIsSetInitialized = (element, engineId) => {
    expect(window.coveoHeadless[engineId].components).toContainEqual({
      element,
      initialized: true
    });
  }

  beforeEach(() => {
    jest.useFakeTimers();
    mockedConsoleError = jest.fn();
    initialize = jest.fn();
    console.error = mockedConsoleError;
    global.CoveoHeadless = CoveoHeadlessStub;
    testElement = document.createElement('div');
    resolvedTestOptions = new Deferred();
    resolvedTestOptions.resolve(testOptions);
  });

  afterEach(() => {
    delete window.coveoHeadless;
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('setInitializedCallback', () => {
    beforeEach(() => {
      window.coveoHeadless = {
        [testId]: {}
      };
    });

    it('should define callback for specified engine', async () => {
      const testCallback = () => {};
      setInitializedCallback(testCallback, testId);

      expect(await window.coveoHeadless[testId].initializedCallback).toBe(testCallback);
    });
  });

  describe('setEngineConfiguration', () => {
    describe('when coveoHeadless is undefined', () => {
      it('should define coveoHeadless and set options', async () => {
        setEngineConfiguration(testOptions, testId, testElement);

        expect(await window.coveoHeadless[testId].options.promise).toBe(testOptions);
      });
    });

    describe('when coveoHeadless is defined', () => {
      beforeEach(() => {
        window.coveoHeadless = {};
      });

      it('should set options', async () => {
        setEngineConfiguration(testOptions, testId, testElement);

        expect(await window.coveoHeadless[testId].options.promise).toBe(testOptions);
      });

      describe('when a options is already preset', () => {
        beforeEach(() => {
          window.coveoHeadless[testId] = {
            options: resolvedTestOptions
          }
        });

        it('should thow an error', () => {
          const newConfig = {
            organizationId: 'otherOrganization',
            accessToken: 'bogus-token-xxxxx-ooooo',
          }  
          let caughtError;
          try {
            setEngineConfiguration(newConfig, testId, testElement);
          } catch(error) {
            caughtError = error.message;
          }

          expect(caughtError).toContain(`Attempted to overwrite configuration for engine: ${testId}`);
        });
      })
    });
  });

  describe('registerComponentForInit', () => {
    const assertComponentIsRegistered = (element) => {
      expect(window.coveoHeadless[testId].components).toContainEqual({
        element,
        initialized: false
      });
    }

    describe('when coveoHeadless is undefined', () => {
      it('should define coveoHeadless and register component', () => {
        registerComponentForInit(testElement, testId);

        assertComponentIsRegistered(testElement);
      });
    });

    describe('when coveoHeadless is defined', () => {
      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: [],
            engine: CoveoHeadlessStub.buildSearchEngine()
          }
        }
      });

      describe('when no search is pending', () => {
        it('should register the component', () => {
          registerComponentForInit(testElement, testId);
  
          assertComponentIsRegistered(testElement);
        });
  
        it('should not register the component if it already is', () => {
          window.coveoHeadless[testId].components.push({
              element: testElement,
              initialized: false
          });
          const mockedPush = jest.fn();
          window.coveoHeadless[testId].components.push = mockedPush;
  
          registerComponentForInit(testElement, testId);
  
          expect(mockedPush).not.toBeCalled();
        });
      });
    });
  });

  describe('setComponentInitialized', () => {
    describe('when coveoHeadless is undefined', () => {
      it('should log an error', () => {
        expect(() => setComponentInitialized(testElement, testId)).toThrowError('Fatal Error: Component was not registered before initialization');
      });
    });

    describe('when coveoHeadless is defined', () => {      
      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: [],
            engine: Promise.resolve(CoveoHeadlessStub.buildSearchEngine()),
            config: new Deferred()
          }
        }
      });

      describe('when other components are still uninitialized ', () => {
        beforeEach(() => {
          window.coveoHeadless[testId].components = [
            {
              element: testElement,
              initialized: false
            },
            createComponentEntryWithInitStatus(false)
          ];
        });

        it('should set the component to initialized', async () => {
          setComponentInitialized(testElement, testId);
  
          assertComponentIsSetInitialized(testElement, testId);
          jest.runAllTimers();
          const engine = await window.coveoHeadless[testId].engine;
          expect(engine.executeFirstSearch).not.toBeCalled();
        });
      });

      describe('when other components are initialized ', () => {
        beforeEach(() => {
          window.coveoHeadless[testId].components = [
            {
              element: testElement,
              initialized: false
            },
            createComponentEntryWithInitStatus(true)
          ];
        });

        it('should set the component to initialized', async () => {
          setComponentInitialized(testElement, testId);
  
          assertComponentIsSetInitialized(testElement, testId);

          jest.runAllTimers();
          await window.coveoHeadless.engine;
          const engine = await window.coveoHeadless[testId].engine;
          expect(engine.executeFirstSearch).toBeCalled();
        });

        describe('when initialized callback is set', () => {
          const callbackMock = jest.fn();
          beforeEach(() => {
            window.coveoHeadless[testId].initializedCallback = callbackMock;
          })
  
          it('should set the component to initialized and execute delayed initalized callback', async () => {
            setComponentInitialized(testElement, testId);
    
            assertComponentIsSetInitialized(testElement, testId);
            jest.runAllTimers();
            await window.coveoHeadless.engine;
            expect(callbackMock).toBeCalled();
          });
        });
      });
    });
  });

  describe('getHeadlessEngine', () => {
    describe('when the engine is undefined with a set options', () => {      
      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: [],
            options: resolvedTestOptions,
          }
        }
      });

      it('should init the engine return a promise that resolves to that instance', async () => {
        const engine = await getHeadlessEngine(testId);

        expect(engine).toBeTruthy();
      });
    });

    describe('when the engine is undefined without a set options', () => {      
      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: [],
          }
        }
      });

      it('should init the engine return a promise that resolves to that instance', async () => {
        let caughtError;
        try {
          await getHeadlessEngine(testId);
        } catch(error) {
          caughtError = error.message;
        }

        expect(caughtError).toContain('Engine configuration has not been set.');
      });
    });

    describe('when the engine is defined', () => {
      const definedEngine = {
        isDefined: true
      };

      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: [],
            engine: Promise.resolve(definedEngine)
          }
        }
      });

      it('should return a promise that resolves to an instance of the engine', async () => {
        const engine = await getHeadlessEngine(testId);

        expect(engine).toEqual(definedEngine);
      });
    });
  });

  describe('initializeWithHeadless', () => {
    describe('when the engine is undefined', () => {      
      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: [{
              element: testElement,
              initialized: false,
            }],
            options: resolvedTestOptions,
          }
        }
      });

      it('should init the engine and initialize ', async () => {
        await initializeWithHeadless(testElement, testId, initialize);
        const engine = await window.coveoHeadless[testId].engine;

        expect(engine).toBeTruthy();
        expect(initialize).toHaveBeenCalled();
        assertComponentIsSetInitialized(testElement, testId);
      });

      describe('when initializing the engine fails', () => {
        const errorMessage = 'simulating failure';
        beforeEach(() => {
          window.coveoHeadless[testId].options = new Deferred();
          window.coveoHeadless[testId].options.reject(errorMessage);
        });
        
        it ('should throw an error', async () => {
          let caughtError;
          initializeWithHeadless(testElement, testId, initialize);
          try {
            await window.coveoHeadless[testId].engine;
          } catch(error) {
            caughtError = error.message;
          }

          expect(caughtError).toContain(errorMessage);
        });
      });
    });

    describe('when the engine is defined', () => {
      const definedEngine = {
        isDefined: true
      }
      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: [{
              element: testElement,
              initialized: false
            }],
            options: resolvedTestOptions,
            engine: Promise.resolve(definedEngine),
          }
        }
      });

      it('should initialize the component using the defined engine', async () => {
        await initializeWithHeadless(testElement, testId, initialize);
        const engine = await window.coveoHeadless[testId].engine;

        expect(engine).toEqual(definedEngine);
        expect(initialize).toHaveBeenCalled();
        assertComponentIsSetInitialized(testElement, testId);
      });
    });
  });
});