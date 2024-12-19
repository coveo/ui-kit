/* eslint-disable no-import-assign */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticGeneratedAnswer from 'c/quanticGeneratedAnswer';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

jest.mock('c/quanticHeadlessLoader');

function createTestComponent(options = {}) {
  prepareHeadlessState();

  const element = createElement('c-quantic-generated-answer', {
    is: QuanticGeneratedAnswer,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

const functionsMocks = {
  buildGeneratedAnswer: jest.fn(() => ({
    subscribe: jest.fn((callback) => callback()),
    state: {},
  })),
  buildSearchStatus: jest.fn(() => ({
    subscribe: jest.fn((callback) => callback()),
    state: {},
  })),
};

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildGeneratedAnswer: functionsMocks.buildGeneratedAnswer,
      buildSearchStatus: functionsMocks.buildSearchStatus,
    };
  };
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const exampleEngine = {
  id: 'dummy engine',
};
let isInitialized = false;

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticGeneratedAnswer && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function cleanup() {
  // The jsdom instance is shared across test cases in a single file so reset the DOM
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.clearAllMocks();
  isInitialized = false;
}

describe('c-quantic-generated-answer', () => {
  beforeAll(() => {
    mockSuccessfulHeadlessInitialization();
  });

  afterEach(() => {
    cleanup();
  });

  describe('controller initialization', () => {
    describe('when the answer configuration id property is passed to the component', () => {
      it('should initialize the controller with the correct answer configuration id value', async () => {
        const exampleAnswerConfigValue = 'exampleAnswerConfig';
        createTestComponent({answerConfigurationId: exampleAnswerConfigValue});
        await flushPromises();

        expect(functionsMocks.buildGeneratedAnswer).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildGeneratedAnswer).toHaveBeenCalledWith(
          exampleEngine,
          expect.objectContaining({
            answerConfigurationId: exampleAnswerConfigValue,
          })
        );
      });
    });

    describe('when the answer configuration id property is not passed to the component', () => {
      it('should initialize the controller without the answer configuration id value', async () => {
        createTestComponent();
        await flushPromises();

        expect(functionsMocks.buildGeneratedAnswer).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildGeneratedAnswer).toHaveBeenCalledWith(
          exampleEngine,
          expect.not.objectContaining({
            answerConfigurationId: expect.any(String),
          })
        );
      });
    });
  });
});
