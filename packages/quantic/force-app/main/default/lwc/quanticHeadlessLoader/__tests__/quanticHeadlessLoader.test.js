/* eslint-disable jest/expect-expect */
import {
  setInitializedCallback,
  setEngineOptions,
  registerComponentForInit,
  setComponentInitialized,
  getHeadlessEnginePromise,
  initializeWithHeadless,
  destroyEngine,
  registerToStore,
  getFromStore,
} from '../quanticHeadlessLoader';
import { Deferred } from '../../quanticUtils/quanticUtils';

describe('c/quanticHeadlessLoader', () => {
  const CoveoHeadlessStub = {
    buildSearchEngine: function() {
      return {
        executeFirstSearch: jest.fn(() => {})
      }  
    }
  }

  const testOptions = {
    configuration: {
      organizationId: 'testOrganization',
      accessToken: 'bogus-token-xxxxx-xxxxx',
      search: {
        pipeline: 'default',
        searchHub: 'default',
      }
    }
  };

  let resolvedTestConfig;
  let mockedConsoleWarn;
  let mockedConsoleError;
  let initialize;
  let testId = 'search-page-1';

  let testElement;

  let mockEngineConstructor;

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

  /**
   * @param {string | number} id
   * @param {Record<String, unknown>} store
   */
  function initQuanticStoreTest(id,store) {
    window.coveoHeadless[id].bindings.store = store;
  }

  beforeEach(() => {
    jest.useFakeTimers();
    initialize = jest.fn();
    mockEngineConstructor = jest.fn().mockReturnValue(CoveoHeadlessStub.buildSearchEngine());
    mockedConsoleWarn = jest.fn();
    mockedConsoleError = jest.fn();
    console.warn = mockedConsoleWarn;
    console.error = mockedConsoleError;
    global.CoveoHeadless = CoveoHeadlessStub;
    testElement = document.createElement('div');
    resolvedTestConfig = new Deferred();
    resolvedTestConfig.resolve(testOptions);
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
      const testCallback = () => { };
      setInitializedCallback(testCallback, testId);

      expect(await window.coveoHeadless[testId].initializedCallback).toBe(testCallback);
    });
  });

  describe('setEngineOptions', () => {
    describe('when coveoHeadless is undefined', () => {
      it('should define coveoHeadless and set options', async () => {
        setEngineOptions(testOptions, mockEngineConstructor, testId, testElement);

        expect(await window.coveoHeadless[testId].options.promise).toBe(testOptions);
      });
    });

    describe('when coveoHeadless is defined', () => {
      beforeEach(() => {
        window.coveoHeadless = {};
      });

      it('should set options', async () => {
        setEngineOptions(testOptions, mockEngineConstructor, testId, testElement);

        expect(await window.coveoHeadless[testId].options.promise).toBe(testOptions);
      });

      describe('when options are already preset', () => {
        beforeEach(() => {
          window.coveoHeadless[testId] = {
            options: resolvedTestConfig
          }
        });

        it('should log a warning', () => {
          const newOptions = {
            configuration: {
              organizationId: 'otherOrganization',
              accessToken: 'bogus-token-xxxxx-ooooo',
            }
          }

          setEngineOptions(newOptions, mockEngineConstructor, testId, testElement);

          expect(mockedConsoleWarn).toBeCalledWith(`Attempted to overwrite engine options for engine ID: ${testId}`)
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
            options: new Deferred()
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
        });

        it('should not execute initialization callback', async () => {
          setComponentInitialized(testElement, testId);

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

  describe('getHeadlessEnginePromise', () => {
    describe('when the engine is undefined with a set options', () => {
      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: [],
            options: resolvedTestConfig,
            engineConstructor: mockEngineConstructor,
            bindings: {}
          }
        }
      });

      it('should init the engine and return a promise', async () => {
        const engine = await getHeadlessEnginePromise(testId);
        expect(mockEngineConstructor).toBeCalled();
        expect(engine).toBeTruthy();
      });
    });

    describe('when the engine is undefined without a set options', () => {
      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: [],
            bindings: {}
          }
        }
      });

      it('should throw an error specifying options have not been set', async () => {
        let caughtError;
        try {
          await getHeadlessEnginePromise(testId);
        } catch (error) {
          caughtError = error.message;
        }

        expect(caughtError).toContain('Engine options have not been set.');
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
            enginePromise: Promise.resolve(definedEngine),
            engineConstructor: mockEngineConstructor,
            bindings: {},
          }
        }
      });

      it('should return a promise that resolves to an instance of the engine', async () => {
        const engine = await getHeadlessEnginePromise(testId);

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
            engineConstructor: mockEngineConstructor,
            options: resolvedTestConfig,
            bindings: {},
          }
        }
      });

      it('should init the engine and initialize ', async () => {
        await initializeWithHeadless(testElement, testId, initialize);
        const engine = await window.coveoHeadless[testId].enginePromise;

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

        it('should throw an error', async () => {
          let caughtError;
          initializeWithHeadless(testElement, testId, initialize);
          try {
            await window.coveoHeadless[testId].enginePromise;
          } catch (error) {
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
            options: resolvedTestConfig,
            enginePromise: Promise.resolve(definedEngine),
            engineConstructor: mockEngineConstructor,
            bindings: {},
          }
        }
      });

      it('should initialize the component using the defined engine', async () => {
        await initializeWithHeadless(testElement, testId, initialize);
        const engine = await window.coveoHeadless[testId].enginePromise;

        expect(engine).toEqual(definedEngine);
        expect(initialize).toHaveBeenCalled();
        assertComponentIsSetInitialized(testElement, testId);
      });
    });
  });

  describe('destroyEngine', () => {
    const otherId = 'other-id';
    beforeEach(() => {
      window.coveoHeadless = {
        [testId]: {},
        [otherId]: {},
      };
    })
    it('should clear the engine instance from window object', () => {
      destroyEngine(testId);

      expect(window.coveoHeadless[testId]).not.toBeDefined();
    });

    it('should not clear other engine instances than the one with specified ID', () => {
      destroyEngine(testId);

      expect(window.coveoHeadless[otherId]).toBeDefined();
    });

    it('should do nothing if the engine does not exist', () => {
      destroyEngine('non-existing-engine');

      expect(window.coveoHeadless[testId]).toEqual({});
    });
  });

  describe('registerToStore', () => {
    beforeEach(() => {
      window.coveoHeadless = {
        [testId]: {
          bindings: {}
        }
      }
    });
    
    it('should log an error when store is undefined', () => {
      initQuanticStoreTest(testId, undefined);
      registerToStore(testId, 'someFacets', { label: '', facetId: ''});

      expect(window.coveoHeadless[testId].bindings.store).not.toBeDefined();
      expect(mockedConsoleError.mock.calls.length).toBe(1);
    });
    
    it('should log an error when store is empty', () => {
      initQuanticStoreTest(testId, {});
      registerToStore(testId, 'someFacets', { label: '', facetId: ''});

      expect(window.coveoHeadless[testId].bindings.store).toStrictEqual({});
      expect(mockedConsoleError.mock.calls.length).toBe(1);
    });

    it('should register the facet data in the store', () => {
      initQuanticStoreTest(testId, { state: { someFacets: {}}});
      registerToStore(testId, 'someFacets', { label: '', facetId: ''});

      expect(window.coveoHeadless[testId].bindings.store.state.someFacets).toBeDefined();
      expect(mockedConsoleError.mock.calls.length).toBe(0);
    });

    it('should not update store with same facetId with new data', () => {
      initQuanticStoreTest(testId, { state: { someFacets: {}}});

      registerToStore(testId, 'someFacets', { label: 'some label', facetId: 'facetId'});
      expect(window.coveoHeadless[testId].bindings.store.state.someFacets.facetId.label).toBe('some label');

      registerToStore(testId, 'someFacets', { label: 'a new label', facetId: 'facetId'});
      expect(window.coveoHeadless[testId].bindings.store.state.someFacets.facetId.label).toBe('some label');
    });
  });

  describe('getFromStore', () => {
    beforeEach(() => {
      window.coveoHeadless = {
        [testId]: {
          bindings: {}
        }
      }
    });

    it('should log an error and return undefined when store is empty', () => {
      initQuanticStoreTest(testId, {});
      const data = getFromStore(testId, 'someFacets');

      expect(data).not.toBeDefined();
      expect(mockedConsoleError.mock.calls.length).toBe(1);
    });

    it('should return undefined when facetType does not exist in store ', () => {
      initQuanticStoreTest(testId, { state: { 'someOtherFacet': { label: 'label', facetId: 'facetId'}}});
      const data = getFromStore(testId, 'someFacets');

      expect(data).not.toBeDefined();
      expect(mockedConsoleError.mock.calls.length).toBe(0);
    });

    it('should return data from store', () => {
      initQuanticStoreTest(testId, { state: { 'someFacets': { label: 'label', facetId: 'facetId'}}});
      const data = getFromStore(testId, 'someFacets');

      expect(data).toBeDefined();
      expect(data.label).toBe('label');
      expect(data.facetId).toBe('facetId');
    });
  })
});

