/* eslint-disable no-import-assign */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticGeneratedAnswer from 'c/quanticGeneratedAnswer';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

let mockAnswerHeight = 300;

jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils', () => ({
  AriaLiveRegion: jest.fn(() => ({
    dispatchMessage: jest.fn(),
  })),
  loadMarkdownDependencies: jest.fn(
    () =>
      new Promise((resolve) => {
        resolve();
      })
  ),
  getAbsoluteHeight: jest.fn(() => {
    return mockAnswerHeight;
  }),
  I18nUtils: {
    format: jest.fn(),
  },
}));

/** @type {Object} */
const defaultOptions = {
  fieldsToIncludeInCitations: 'sfid,sfkbid,sfkavid',
  answerConfigurationId: undefined,
  withToggle: false,
  collapsible: false,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-generated-answer', {
    is: QuanticGeneratedAnswer,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

const selectors = {
  initializationError: 'c-quantic-component-error',
  generatedAnswerCard: '[data-testid="generated-answer__card"]',
  generatedAnswerBadge: '[data-testid="generated-answer__badge"]',
  generatedAnswerRetryButton: '[data-testid="generated-answer__retry-button"]',
  generatedAnswerActions: '[data-testid="generated-answer__actions"]',
  generatedAnswerToggleButton: 'c-quantic-generated-answer-toggle',
  generatedAnswerContent: 'c-quantic-generated-answer-content',
  generatingMessageWhenAnswerCollapsed:
    '[data-testid="generated-answer__collapse-generating-message"]',
  generatedAnswerCollapseToggle:
    '[data-testid="generated-answer__answer-toggle"]',
  generatedAnswerDisclaimer: '[data-testid="generated-answer__disclaimer"]',
};

const initialSearchStatusState = {
  hasError: false,
};
let searchStatusState = initialSearchStatusState;

const initialGeneratedAnswerState = {isVisible: true};
let generatedAnswerState = initialGeneratedAnswerState;

const functionsMocks = {
  buildGeneratedAnswer: jest.fn(() => ({
    state: generatedAnswerState,
    subscribe: functionsMocks.generatedAnswerStateSubscriber,
    retry: functionsMocks.retry,
  })),
  buildSearchStatus: jest.fn(() => ({
    state: searchStatusState,
    subscribe: functionsMocks.searchStatusStateSubscriber,
  })),
  generatedAnswerStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.generatedAnswerStateUnsubscriber;
  }),
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  generatedAnswerStateUnsubscriber: jest.fn(),
  searchStatusStateUnsubscriber: jest.fn(),
  retry: jest.fn(),
};

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const exampleEngine = {
  id: 'dummy engine',
};
let isInitialized = false;
const maximumAnswerHeight = 250;

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildGeneratedAnswer: functionsMocks.buildGeneratedAnswer,
      buildSearchStatus: functionsMocks.buildSearchStatus,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticGeneratedAnswer && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticGeneratedAnswer) {
      element.setInitializationError();
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
  afterEach(() => {
    cleanup();
  });

  describe('when an initialization error occurs', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
    });

    it('should display the initialization error component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const initializationError = element.shadowRoot.querySelector(
        selectors.initializationError
      );

      expect(initializationError).not.toBeNull();
    });
  });

  describe('when an RGA retryable error occurs', () => {
    beforeEach(() => {
      searchStatusState = {...initialSearchStatusState, hasError: false};
      generatedAnswerState = {
        ...initialGeneratedAnswerState,
        error: {
          isRetryable: true,
        },
      };
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    afterAll(() => {
      generatedAnswerState = initialGeneratedAnswerState;
      searchStatusState = initialSearchStatusState;
    });

    it('should display retry prompt', async () => {
      const element = createTestComponent();
      await flushPromises();

      const generatedAnswerCard = element.shadowRoot.querySelector(
        selectors.generatedAnswerCard
      );
      const generatedAnswerRetryButton = element.shadowRoot.querySelector(
        selectors.generatedAnswerRetryButton
      );

      expect(generatedAnswerCard).not.toBeNull();
      expect(generatedAnswerRetryButton).not.toBeNull();
    });

    describe('when the retry button is clicked', () => {
      it('should call the retry method of the generated answer controller controller', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerRetryButton = element.shadowRoot.querySelector(
          selectors.generatedAnswerRetryButton
        );

        expect(generatedAnswerRetryButton).not.toBeNull();
        generatedAnswerRetryButton.click();
        expect(functionsMocks.retry).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('controller initialization', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should build the generated answer and search status controllers with the proper parameters', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildGeneratedAnswer).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildGeneratedAnswer).toHaveBeenCalledWith(
        exampleEngine,
        {
          initialState: {
            isVisible: true,
            responseFormat: {
              contentFormat: ['text/markdown', 'text/plain'],
            },
          },
          fieldsToIncludeInCitations:
            defaultOptions.fieldsToIncludeInCitations.split(','),
        }
      );
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledWith(
        exampleEngine
      );
    });

    it('should subscribe to the headless generated answer and search status state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(
        functionsMocks.generatedAnswerStateSubscriber
      ).toHaveBeenCalledTimes(1);
      expect(functionsMocks.searchStatusStateSubscriber).toHaveBeenCalledTimes(
        1
      );
    });

    describe('when the answer configuration id property is passed to the component', () => {
      it('should initialize the controller with the correct answer configuration id value', async () => {
        const exampleAnswerConfigValue = 'exampleAnswerConfig';
        createTestComponent({
          ...defaultOptions,
          answerConfigurationId: exampleAnswerConfigValue,
        });
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

  describe('the rendering of the generated answer', () => {
    describe('when the answer is streaming', () => {
      const exampleAnswer = 'answer being generated';
      const exampleAnswerContentFormat = 'text/markdown';
      beforeEach(() => {
        generatedAnswerState = {
          ...initialGeneratedAnswerState,
          isStreaming: true,
          answer: exampleAnswer,
          answerContentFormat: exampleAnswerContentFormat,
        };
        mockSuccessfulHeadlessInitialization();
        prepareHeadlessState();
      });

      afterAll(() => {
        generatedAnswerState = initialGeneratedAnswerState;
      });

      it('should display the generated answer card', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerCard = element.shadowRoot.querySelector(
          selectors.generatedAnswerCard
        );
        const generatedAnswerBadge = element.shadowRoot.querySelector(
          selectors.generatedAnswerBadge
        );

        expect(generatedAnswerCard).not.toBeNull();
        expect(generatedAnswerBadge).not.toBeNull();
      });

      describe('when the property withToggle is set to true', () => {
        it('should display the generated answer toggle button', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            withToggle: true,
          });
          await flushPromises();

          const generatedAnswerToggleButton = element.shadowRoot.querySelector(
            selectors.generatedAnswerToggleButton
          );

          expect(generatedAnswerToggleButton).not.toBeNull();
        });
      });

      describe('when the property collapsible is set to true', () => {
        describe('when the answer is shorter than the maximum answer height', () => {
          beforeEach(() => {
            mockAnswerHeight = maximumAnswerHeight - 100;
          });

          it('should not display the generating answer message', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              collapsible: true,
            });
            await flushPromises();

            const generatingMessageWhenAnswerCollapsed =
              element.shadowRoot.querySelector(
                selectors.generatingMessageWhenAnswerCollapsed
              );

            expect(generatingMessageWhenAnswerCollapsed).toBeNull();
          });
        });

        describe('when the answer is longer than the maximum answer height', () => {
          beforeEach(() => {
            mockAnswerHeight = maximumAnswerHeight + 100;
          });

          it('should display the generating answer message', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              collapsible: true,
            });
            await flushPromises();

            const generatingMessageWhenAnswerCollapsed =
              element.shadowRoot.querySelector(
                selectors.generatingMessageWhenAnswerCollapsed
              );

            expect(generatingMessageWhenAnswerCollapsed).not.toBeNull();
          });

          it('should not display the generated answer collapse toggle', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              collapsible: true,
            });
            await flushPromises();

            const generatedAnswerCollapseToggle =
              element.shadowRoot.querySelector(
                selectors.generatedAnswerCollapseToggle
              );

            expect(generatedAnswerCollapseToggle).toBeNull();
          });
        });
      });

      it('should display the generated answer content', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerContent = element.shadowRoot.querySelector(
          selectors.generatedAnswerContent
        );

        expect(generatedAnswerContent).not.toBeNull();
        expect(generatedAnswerContent.isStreaming).toBe(true);
        expect(generatedAnswerContent.answer).toBe(exampleAnswer);
        expect(generatedAnswerContent.answerContentFormat).toBe(
          exampleAnswerContentFormat
        );
      });

      it('should not display the generated answer actions', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerActions = element.shadowRoot.querySelector(
          selectors.generatedAnswerActions
        );

        expect(generatedAnswerActions).toBeNull();
      });

      it('should not display the generated answer disclaimer', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerDisclaimer = element.shadowRoot.querySelector(
          selectors.generatedAnswerDisclaimer
        );

        expect(generatedAnswerDisclaimer).toBeNull();
      });
    });

    describe('when the answer is ready', () => {
      const exampleAnswer = 'answer generated successfully';
      const exampleAnswerContentFormat = 'text/markdown';
      beforeEach(() => {
        generatedAnswerState = {
          ...initialGeneratedAnswerState,
          isStreaming: false,
          answer: exampleAnswer,
          answerContentFormat: exampleAnswerContentFormat,
        };
        mockSuccessfulHeadlessInitialization();
        prepareHeadlessState();
      });

      afterAll(() => {
        generatedAnswerState = initialGeneratedAnswerState;
      });

      it('should display the generated answer card', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerCard = element.shadowRoot.querySelector(
          selectors.generatedAnswerCard
        );
        const generatedAnswerBadge = element.shadowRoot.querySelector(
          selectors.generatedAnswerBadge
        );

        expect(generatedAnswerCard).not.toBeNull();
        expect(generatedAnswerBadge).not.toBeNull();
      });

      describe('when the property withToggle is set to true', () => {
        it('should display the generated answer toggle button', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            withToggle: true,
          });
          await flushPromises();

          const generatedAnswerToggleButton = element.shadowRoot.querySelector(
            selectors.generatedAnswerToggleButton
          );

          expect(generatedAnswerToggleButton).not.toBeNull();
        });
      });

      describe('when the property collapsible is set to true', () => {
        describe('when the answer is shorter than the maximum answer height', () => {
          beforeEach(() => {
            mockAnswerHeight = maximumAnswerHeight - 100;
          });

          it('should not display the generating answer message', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              collapsible: true,
            });
            await flushPromises();

            const generatingMessageWhenAnswerCollapsed =
              element.shadowRoot.querySelector(
                selectors.generatingMessageWhenAnswerCollapsed
              );

            expect(generatingMessageWhenAnswerCollapsed).toBeNull();
          });

          it('should not display the generated answer collapse toggle', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              collapsible: true,
            });
            await flushPromises();

            const generatedAnswerCollapseToggle =
              element.shadowRoot.querySelector(
                selectors.generatedAnswerCollapseToggle
              );

            expect(generatedAnswerCollapseToggle).toBeNull();
          });
        });

        describe('when the answer is longer than the maximum answer height', () => {
          beforeEach(() => {
            mockAnswerHeight = maximumAnswerHeight + 100;
          });

          it('should not display the generating answer message', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              collapsible: true,
            });
            await flushPromises();

            const generatingMessageWhenAnswerCollapsed =
              element.shadowRoot.querySelector(
                selectors.generatingMessageWhenAnswerCollapsed
              );

            expect(generatingMessageWhenAnswerCollapsed).toBeNull();
          });

          it('should display the generated answer collapse toggle', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              collapsible: true,
            });
            await flushPromises();

            const generatedAnswerCollapseToggle =
              element.shadowRoot.querySelector(
                selectors.generatedAnswerCollapseToggle
              );

            expect(generatedAnswerCollapseToggle).not.toBeNull();
          });
        });
      });

      it('should display the generated answer content', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerContent = element.shadowRoot.querySelector(
          selectors.generatedAnswerContent
        );

        expect(generatedAnswerContent).not.toBeNull();
        expect(generatedAnswerContent.isStreaming).toBe(false);
        expect(generatedAnswerContent.answer).toBe(exampleAnswer);
        expect(generatedAnswerContent.answerContentFormat).toBe(
          exampleAnswerContentFormat
        );
      });

      it('should display the generated answer actions', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerActions = element.shadowRoot.querySelector(
          selectors.generatedAnswerActions
        );

        expect(generatedAnswerActions).not.toBeNull();
      });

      it('should not display the generated answer disclaimer', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerDisclaimer = element.shadowRoot.querySelector(
          selectors.generatedAnswerDisclaimer
        );

        expect(generatedAnswerDisclaimer).not.toBeNull();
      });
    });

    describe('when the answer is empty', () => {
      const exampleEmptyAnswer = '';
      const exampleAnswerContentFormat = 'text/markdown';
      beforeEach(() => {
        generatedAnswerState = {
          ...initialGeneratedAnswerState,
          isStreaming: false,
          answer: exampleEmptyAnswer,
          answerContentFormat: exampleAnswerContentFormat,
        };
        mockSuccessfulHeadlessInitialization();
        prepareHeadlessState();
      });

      afterAll(() => {
        generatedAnswerState = initialGeneratedAnswerState;
      });

      it('should not display the generated answer card', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerCard = element.shadowRoot.querySelector(
          selectors.generatedAnswerCard
        );

        expect(generatedAnswerCard).toBeNull();
      });
    });
  });
});
