/* eslint-disable jest/expect-expect */
import {
  registerComponentForInit,
  setComponentInitialized,
  getHeadlessEngine,
  initializeWithHeadless
} from '../headlessLoader';
import { CoveoHeadlessStub, MockEngine } from '../../testUtils/coveoHeadlessStub';

describe('c/headlessLoader', () => {
  const dispatchMock = jest.fn();

  let mockedConsoleError;
  let initialize;
  let testId = 'search-page-1';

  const createComponentEntryWithInitStatus = (isInitialized) => ({
    element: document.createElement('div'),
    initialized: isInitialized
  });

  const assertComponentIsSetInitialized = (element, searchInterfaceId) => {
    expect(window.coveoHeadless[searchInterfaceId].components).toContainEqual({
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
  });

  afterEach(() => {
    delete window.coveoHeadless;
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('registerComponentForInit', () => {
    const assertComponentIsRegistered = (element) => {
      expect(window.coveoHeadless[testId].components).toContainEqual({
        element,
        initialized: false
      });
    }

    describe('when coveoHeadless is undefined', () => {
      it('should initialize coveoHeadless and register component', () => {
        const element = document.createElement('div');
        registerComponentForInit(element, testId);

        assertComponentIsRegistered(element);
      });
    });

    describe('when coveoHeadless is defined', () => {
      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: [],
            engine: {
              dispatch: dispatchMock
            }
          }
        }
      });

      describe('when no search is pending', () => {
        it('should register the component', () => {
          const element = document.createElement('div');
          registerComponentForInit(element, testId);
  
          assertComponentIsRegistered(element);
        });
  
        it('should not register the component if it already is', () => {
          const element = document.createElement('div');
          window.coveoHeadless[testId].components.push({
              element,
              initialized: false
          });
          const mockedPush = jest.fn();
          window.coveoHeadless[testId].components.push = mockedPush;
  
          registerComponentForInit(element, testId);
  
          expect(mockedPush).not.toBeCalled();
        });
      });
    });
  });

  describe('setComponentInitialized', () => {
    describe('when coveoHeadless is undefined', () => {
      it('should log an error', () => {
        const element = document.createElement('div');

        expect(() => setComponentInitialized(element, testId)).toThrowError('Fatal Error: Component was not registered before initialization');
      });
    });

    describe('when coveoHeadless is defined', () => {      
      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: [],
            engine: {
              dispatch: dispatchMock
            }
          }
        }
      });

      describe('when other components are still unintialized ', () => {
        const element = document.createElement('div');

        beforeEach(() => {
          window.coveoHeadless[testId].components = [
            {
              element,
              initialized: false
            },
            createComponentEntryWithInitStatus(false)
          ];
        });

        it('should set the component to initialized', () => {
          setComponentInitialized(element, testId);
  
          assertComponentIsSetInitialized(element, testId);
          jest.runAllTimers();
          expect(dispatchMock).not.toBeCalled();
        });
      });

      describe('when other components are initialized ', () => {
        const element = document.createElement('div');

        beforeEach(() => {
          window.coveoHeadless[testId].components = [
            {
              element,
              initialized: false
            },
            createComponentEntryWithInitStatus(true)
          ];
        });

        it('should set the component to initialized and start delayed search', () => {
          setComponentInitialized(element, testId);
  
          assertComponentIsSetInitialized(element, testId);
          jest.runAllTimers();
          expect(dispatchMock).toBeCalled();
        });
      });
    });
  });

  describe('getHeadlessEngine', () => {
    const element = document.createElement('div');

    describe('when the engine is undefined', () => {      
      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: []
          }
        }
      });

      it('should init the engine return a promise that resolves to that instance', async () => {
        const engine = await getHeadlessEngine(element, testId);

        expect(engine).toBeInstanceOf(MockEngine);
      });
    });

    describe('when the engine is defined', () => {
      const definedEngine = {
        isDefined: true
      }
      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: [],
            engine: definedEngine
          }
        }
      });

      it('should return a promise that resolves to an instance of the engine', async () => {
        const engine = await getHeadlessEngine(element, testId);

        expect(engine).toEqual(definedEngine);
      });
    });
  });

  describe('initializeWithHeadless', () => {
    const element = document.createElement('div');

    describe('when the engine is undefined', () => {      
      beforeEach(() => {
        window.coveoHeadless = {
          [testId]: {
            components: [{
              element,
              initialized: false
            }]
          }
        }
      });

      it('should init the engine and initialize ', async () => {
        initializeWithHeadless(element, testId, initialize);
        const engine = await window.coveoHeadless[testId].engine;

        expect(engine).toBeInstanceOf(MockEngine);
        expect(initialize).toHaveBeenCalled();
        assertComponentIsSetInitialized(element, testId);
      });

      describe('when initializing the engine fails', () => {
        const error = new Error('simulating failure');
        beforeEach(() => {
          jest
            .spyOn(CoveoHeadlessStub.HeadlessEngine, 'getSampleConfiguration')
            .mockImplementation(() => {throw error});
        });
        
        it ('should log an error', async () => {
          initializeWithHeadless(element, testId, initialize);
          await window.coveoHeadless[testId].engine;

          expect(mockedConsoleError).toHaveBeenCalled();
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
              element,
              initialized: false
            }],
            engine: definedEngine
          }
        }
      });

      it('should initialize the component using the defined engine', async () => {
        initializeWithHeadless(element, testId, initialize);
        const engine = await window.coveoHeadless[testId].engine;

        expect(engine).toEqual(definedEngine);
        expect(initialize).toHaveBeenCalled();
        assertComponentIsSetInitialized(element, testId);
      });
    });
  });
});