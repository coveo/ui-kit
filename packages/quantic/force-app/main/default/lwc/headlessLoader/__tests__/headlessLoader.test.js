/* eslint-disable jest/expect-expect */
import {
  executeInitialSearch,
  registerComponentForInit,
  setComponentInitialized,
  getHeadlessEngine
} from '../headlessLoader';
import { CoveoHeadlessStub, MockEngine } from '../../testUtils/coveoHeadlessStub';

describe('c/headlessLoader', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.CoveoHeadless = CoveoHeadlessStub;
  });

  afterEach(() => {
    delete window.coveoHeadless;
    jest.restoreAllMocks();
  });

  describe('registerComponentForInit', () => {
    const assertComponentIsRegistered = (element) => {
      expect(window.coveoHeadless.components).toContainEqual({
        element,
        initialized: false
      });
    }

    describe('when coveoHeadless is undefined', () => {
      it('should initialize coveoHeadless and register component', () => {
        const element = document.createElement('div');
        registerComponentForInit(element);

        assertComponentIsRegistered(element);
      });
    });

    describe('when coveoHeadless is defined', () => {
      beforeEach(() => {
        window.coveoHeadless = {
          components: [],
          engine: undefined
        }
      });

      describe('when no search is pending', () => {
        it('should register the component', () => {
          const element = document.createElement('div');
          registerComponentForInit(element);
  
          assertComponentIsRegistered(element);
        });
  
        it('should not register the component if it already is', () => {
          const element = document.createElement('div');
          window.coveoHeadless.components.push({
              element,
              initialized: false
          });
          const mockedPush = jest.fn();
          window.coveoHeadless.components.push = mockedPush;
  
          registerComponentForInit(element);
  
          expect(mockedPush).not.toBeCalled();
        });
      });
  
      describe('when search is pending', () => {
        beforeEach(() =>{
          executeInitialSearch();
        });
  
        it('should cancel search and register the component', () => {
            const element = document.createElement('div');
            registerComponentForInit(element);
  
            expect(clearTimeout).toBeCalled();
            assertComponentIsRegistered(element);
        });
      });
    });
  });

  describe('setComponentInitialized', () => {
    const dispatchMock = jest.fn();

    const createComponentEntryWithInitStatus = (isInitialized) => ({
      element: document.createElement('div'),
      initialized: isInitialized
    });

    const assertComponentIsSetInitialized = (element) => {
      expect(window.coveoHeadless.components).toContainEqual({
        element,
        initialized: true
      });
    }

    describe('when coveoHeadless is undefined', () => {
      it('should log an error', () => {
        const mockedLog = jest.fn();
        console.log = mockedLog;
        const element = document.createElement('div');
        setComponentInitialized(element);

        expect(mockedLog).toBeCalledWith('Fatal Error: Component was not registered before initialization.');
      });
    });

    describe('when coveoHeadless is defined', () => {      
      beforeEach(() => {
        window.coveoHeadless = {
          components: [],
          engine: {
            dispatch: dispatchMock
          }
        }
      });

      describe('when other components are still unintialized ', () => {
        const element = document.createElement('div');

        beforeEach(() => {
          window.coveoHeadless.components = [
            {
              element,
              initialized: false
            },
            createComponentEntryWithInitStatus(false)
          ];
        });

        it('should set the component to initialized', () => {
          setComponentInitialized(element);
  
          assertComponentIsSetInitialized(element);
          jest.runAllTimers();
          expect(dispatchMock).not.toBeCalled();
        });
      });

      describe('when other components are initialized ', () => {
        const element = document.createElement('div');

        beforeEach(() => {
          window.coveoHeadless.components = [
            {
              element,
              initialized: false
            },
            createComponentEntryWithInitStatus(true)
          ];
        });

        it('should set the component to initialized and start delayed search', () => {
          setComponentInitialized(element);
  
          assertComponentIsSetInitialized(element);
          jest.runAllTimers();
          expect(dispatchMock).toBeCalled();
        });
      });
    });
  });

  describe('getHeadlessEngine', () => {
    const element = document.createElement('div');

    describe('when coveoHeadless is undefined', () => {      
      beforeEach(() => {
        window.coveoHeadless = {
          components: []
        }
      });

      it('should init the engine return a promise that resolves to that instance', async () => {
        const engine = await getHeadlessEngine(element);
        expect(engine).toBeInstanceOf(MockEngine);
      });

      describe('when initializing the engine fails', () => {
        beforeEach(() => {
          jest
            .spyOn(CoveoHeadlessStub.HeadlessEngine, 'getSampleConfiguration')
            .mockImplementation(() => {throw new Error('simulating failure')});
        });
        
        it ('should log an error', async () => {
          const mockedLog = jest.fn();
          console.log = mockedLog;
          setComponentInitialized(element);

          expect(mockedLog).toBeCalledWith('Fatal Error: Component was not registered before initialization.');
        });
      });
    });

    describe('when coveoHeadless is defined', () => {
      const definedEngine = {
        isDefined: true
      }
      beforeEach(() => {
        window.coveoHeadless = {
          components: [],
          engine: definedEngine
        }
      });

      it('should return a promise that resolves to an instance of the engine', async () => {
        const engine = await getHeadlessEngine(element);
        expect(engine).toEqual(definedEngine);
      });
    });
  });
});