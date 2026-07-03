/* eslint-disable no-import-assign */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticGeneratedAnswer from 'c/quanticGeneratedAnswer';
import FeedbackModalQna from 'c/quanticFeedbackModalQna';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

let mockAnswerHeight = 250;
let mockedConsoleWarn;

const exampleItemOne = document.createElement('div');
exampleItemOne.innerText = 'Custom error message';
const exampleAssignedElements = [exampleItemOne];
const exampleCitations = [
  {
    id: 'citation1',
    title: 'Example Citation 1',
    uri: 'https://example.com/1',
  },
  {
    id: 'citation2',
    title: 'Example Citation 2',
    uri: 'https://example.com/2',
  },
];
const exampleEngineId = 'example engine id';
const exampleAnswerId = 'example answer id';
jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticFeedbackModalQna', () => ({
  __esModule: true,
  default: {
    open: jest.fn(() => Promise.resolve()),
  },
}));
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
jest.mock(
  '@salesforce/label/c.quantic_NoGeneratedAnswer',
  () => ({default: 'No generated answer available.'}),
  {
    virtual: true,
  }
);

/** @type {Object} */
const defaultOptions = {
  engineId: exampleEngineId,
  fieldsToIncludeInCitations: 'sfid,sfkbid,sfkavid,filetype',
  answerConfigurationId: undefined,
  withToggle: false,
  collapsible: false,
  maxCollapsedHeight: 250,
};

function createTestComponent(options = defaultOptions, assignedElements = []) {
  mockSlotAssignedNodes(assignedElements);
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
  generatedAnswerHeader: '[data-testid="generated-answer__header"]',
  generatedAnswerBody: '[data-testid="generated-answer__body"]',
  generatedAnswerFooter: '[data-testid="generated-answer__footer"]',
  generatedAnswer: '[data-testid="generated-answer__answer"]',
  generatedAnswerBadge: '[data-testid="generated-answer__header-title"]',
  generatedAnswerRetryButton: '[data-testid="generated-answer__retry-button"]',
  generatedAnswerToggleButton: 'c-quantic-generated-answer-toggle',
  generatedAnswerBodyComponent: 'c-quantic-generated-answer-body',
  generatingMessageWhenAnswerCollapsed:
    '[data-testid="generated-answer__collapse-generating-message"]',
  generatedAnswerCollapseToggle:
    '[data-testid="generated-answer__answer-toggle"]',
  generatedAnswerDisclaimer: '[data-testid="generated-answer__disclaimer"]',
  generatedAnswerNoAnswerCard:
    '[data-testid="generated-answer__no-answer-card"]',
  generatedAnswerNoAnswerMessage:
    '[data-testid="generated-answer__no-answer-message"]',
  generatedAnswerThread: 'c-quantic-generated-answer-thread',
  generatedAnswerFollowUpInput: 'c-quantic-generated-answer-follow-up-input',
  loadingSpinner: 'lightning-spinner',
};

const initialSearchStatusState = {
  hasError: false,
};
let searchStatusState = initialSearchStatusState;

const initialGeneratedAnswerState = {
  isVisible: true,
  cannotAnswer: false,
};
let generatedAnswerState = initialGeneratedAnswerState;

const functionsMocks = {
  buildGeneratedAnswer: jest.fn(() => ({
    state: generatedAnswerState,
    subscribe: functionsMocks.generatedAnswerStateSubscriber,
    retry: functionsMocks.retry,
    askFollowUp: functionsMocks.askFollowUp,
    like: functionsMocks.like,
    dislike: functionsMocks.dislike,
    closeFeedbackModal: functionsMocks.closeFeedbackModal,
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
  askFollowUp: jest.fn(),
  like: jest.fn(),
  dislike: jest.fn(),
  closeFeedbackModal: jest.fn(),
};

/**
 * Mocks the return value of the assignedNodes method.
 * @param {Array<Element>} assignedElements
 */
function mockSlotAssignedNodes(assignedElements) {
  HTMLSlotElement.prototype.assignedNodes = function () {
    return assignedElements;
  };
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const exampleQuery = 'example query';
const exampleEngine = {
  id: 'dummy engine',
  state: {query: {q: exampleQuery}},
};
let isInitialized = false;
const defaultAnswerHeight = 250;

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
  beforeEach(() => {
    mockedConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
  });

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

    describe('when the agent id property is passed to the component', () => {
      it('should initialize the controller with the correct agent id value', async () => {
        const exampleAgentId = 'example agent id';
        createTestComponent({
          ...defaultOptions,
          agentId: exampleAgentId,
        });
        await flushPromises();

        expect(functionsMocks.buildGeneratedAnswer).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildGeneratedAnswer).toHaveBeenCalledWith(
          exampleEngine,
          expect.objectContaining({agentId: exampleAgentId})
        );
      });
    });

    describe('when the agent id property is not passed to the component', () => {
      it('should initialize the controller without the agent id value', async () => {
        createTestComponent();
        await flushPromises();

        expect(functionsMocks.buildGeneratedAnswer).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildGeneratedAnswer).toHaveBeenCalledWith(
          exampleEngine,
          expect.not.objectContaining({agentId: expect.any(String)})
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
          answerId: exampleAnswerId,
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
            mockAnswerHeight = defaultAnswerHeight - 100;
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
            mockAnswerHeight = defaultAnswerHeight + 100;
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

      it('should forward the streaming answer to the generated answer body', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerBody = element.shadowRoot.querySelector(
          selectors.generatedAnswerBodyComponent
        );

        expect(generatedAnswerBody).not.toBeNull();
        expect(generatedAnswerBody.engineId).toBe(exampleEngineId);
        expect(generatedAnswerBody.disableCitationAnchoring).toBe(false);
        expect(generatedAnswerBody.generatedAnswer).toEqual(
          expect.objectContaining({
            answer: exampleAnswer,
            answerContentFormat: exampleAnswerContentFormat,
            answerId: exampleAnswerId,
            isStreaming: true,
          })
        );
      });

      it('should not display the generated answer disclaimer in the footer', async () => {
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
          citations: exampleCitations,
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
            mockAnswerHeight = defaultAnswerHeight - 100;
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
            mockAnswerHeight = defaultAnswerHeight + 100;
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

        describe('when the property maxCollapsedHeight is set to a custom value', () => {
          // The valid range is between 150 and 500 pixels.
          describe('when the maxCollapsedHeight value is within the valid range and the answer exceeds it', () => {
            it('should display the generated answer as collapsed and set the maxHeight of the generated answer to the given custom value', async () => {
              const expectedMaxCollapsibleAnswerHeight = 300;
              mockAnswerHeight = 350;
              const element = createTestComponent({
                ...defaultOptions,
                collapsible: true,
                maxCollapsedHeight: expectedMaxCollapsibleAnswerHeight,
              });
              await flushPromises();

              const generatedAnswer = element.shadowRoot.querySelector(
                selectors.generatedAnswer
              );
              expect(generatedAnswer).not.toBeNull();

              const generatedAnswerCollapseToggle =
                element.shadowRoot.querySelector(
                  selectors.generatedAnswerCollapseToggle
                );
              expect(generatedAnswerCollapseToggle).not.toBeNull();

              const maxHeightValue =
                generatedAnswer.style.getPropertyValue('--maxHeight');
              expect(maxHeightValue).toEqual(
                `${expectedMaxCollapsibleAnswerHeight}px`
              );

              expect(mockedConsoleWarn).not.toHaveBeenCalled();
            });
          });

          describe('when the maxCollapsedHeight value is greater than the valid range', () => {
            it('should set the generated answer height with the fallback default value and log a warning in the console', async () => {
              const exampleMaxCollapsedHeightValue = 550;
              const element = createTestComponent({
                ...defaultOptions,
                collapsible: true,
                maxCollapsedHeight: exampleMaxCollapsedHeightValue,
              });
              await flushPromises();

              const generatedAnswer = element.shadowRoot.querySelector(
                selectors.generatedAnswer
              );
              expect(generatedAnswer).not.toBeNull();

              const generatedAnswerCollapseToggle =
                element.shadowRoot.querySelector(
                  selectors.generatedAnswerCollapseToggle
                );
              expect(generatedAnswerCollapseToggle).not.toBeNull();

              const maxHeightValue =
                generatedAnswer.style.getPropertyValue('--maxHeight');
              expect(maxHeightValue).toEqual(`${defaultAnswerHeight}px`);

              expect(mockedConsoleWarn).toHaveBeenCalledTimes(1);
              expect(mockedConsoleWarn).toHaveBeenCalledWith(
                `Cannot set max-collapsed-height to (${exampleMaxCollapsedHeightValue}) it accepts a range between 150 and 500. The default value of 250px will be used.`
              );
            });
          });

          describe('when the maxCollapsedHeight value is smaller than the valid range', () => {
            it('should set the generated answer height with the fallback default value and log a warning in the console', async () => {
              const exampleMaxCollapsedHeightValue = 100;
              const element = createTestComponent({
                ...defaultOptions,
                collapsible: true,
                maxCollapsedHeight: exampleMaxCollapsedHeightValue,
              });
              await flushPromises();

              const generatedAnswer = element.shadowRoot.querySelector(
                selectors.generatedAnswer
              );
              expect(generatedAnswer).not.toBeNull();

              const generatedAnswerCollapseToggle =
                element.shadowRoot.querySelector(
                  selectors.generatedAnswerCollapseToggle
                );
              expect(generatedAnswerCollapseToggle).not.toBeNull();

              const maxHeightValue =
                generatedAnswer.style.getPropertyValue('--maxHeight');

              expect(maxHeightValue).toEqual(`${defaultAnswerHeight}px`);

              expect(mockedConsoleWarn).toHaveBeenCalledTimes(1);
              expect(mockedConsoleWarn).toHaveBeenCalledWith(
                `Cannot set max-collapsed-height to (${exampleMaxCollapsedHeightValue}) it accepts a range between 150 and 500. The default value of 250px will be used.`
              );
            });
          });
        });
      });

      it('should forward the ready answer with citations to the generated answer body', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerBody = element.shadowRoot.querySelector(
          selectors.generatedAnswerBodyComponent
        );

        expect(generatedAnswerBody).not.toBeNull();
        expect(generatedAnswerBody.engineId).toBe(exampleEngineId);
        expect(generatedAnswerBody.disableCitationAnchoring).toBe(false);
        expect(generatedAnswerBody.generatedAnswer).toEqual(
          expect.objectContaining({
            answer: exampleAnswer,
            answerContentFormat: exampleAnswerContentFormat,
            citations: exampleCitations,
            isStreaming: false,
          })
        );
      });

      it('should collapse the answer when the body reports a content height exceeding the maximum collapsed height', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          collapsible: true,
        });
        await flushPromises();

        const generatedAnswerBody = element.shadowRoot.querySelector(
          selectors.generatedAnswerBodyComponent
        );
        generatedAnswerBody.dispatchEvent(
          new CustomEvent('quantic__answercontentupdated', {
            detail: {height: defaultAnswerHeight + 100},
          })
        );
        await flushPromises();

        const generatedAnswerCollapseToggle = element.shadowRoot.querySelector(
          selectors.generatedAnswerCollapseToggle
        );
        expect(generatedAnswerCollapseToggle).not.toBeNull();
      });

      it('should display the generated answer disclaimer', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerFooter = element.shadowRoot.querySelector(
          selectors.generatedAnswerFooter
        );
        const generatedAnswerDisclaimer = element.shadowRoot.querySelector(
          selectors.generatedAnswerDisclaimer
        );

        expect(generatedAnswerFooter).not.toBeNull();
        expect(generatedAnswerDisclaimer).not.toBeNull();
      });

      it('should display the generated answer header content', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerHeader = element.shadowRoot.querySelector(
          selectors.generatedAnswerHeader
        );
        const generatedAnswerBadge = element.shadowRoot.querySelector(
          selectors.generatedAnswerBadge
        );

        expect(generatedAnswerHeader).not.toBeNull();
        expect(generatedAnswerBadge).not.toBeNull();
      });

      describe('when follow-ups are enabled', () => {
        const exampleAgentId = 'example agent id';
        const exampleFollowUpAnswers = [
          {
            answer: 'follow-up answer',
            answerId: 'answer-id-2',
            question: 'follow-up question',
          },
        ];
        const followUpOptions = {...defaultOptions, agentId: exampleAgentId};

        beforeEach(() => {
          generatedAnswerState = {
            ...initialGeneratedAnswerState,
            answer: exampleAnswer,
            answerId: 'answer-id-1',
            followUpAnswers: {
              isEnabled: true,
              followUpAnswers: exampleFollowUpAnswers,
            },
          };
        });

        it('should render the conversation thread and follow-up input instead of the single answer body', async () => {
          const element = createTestComponent(followUpOptions);
          await flushPromises();

          const thread = element.shadowRoot.querySelector(
            selectors.generatedAnswerThread
          );
          const followUpInput = element.shadowRoot.querySelector(
            selectors.generatedAnswerFollowUpInput
          );
          const singleAnswerBody = element.shadowRoot.querySelector(
            selectors.generatedAnswerBody
          );

          expect(thread).not.toBeNull();
          expect(followUpInput).not.toBeNull();
          expect(singleAnswerBody).toBeNull();
        });

        it('should display the scrollable container', async () => {
          const element = createTestComponent(followUpOptions);
          await flushPromises();

          const scrollableContainer = element.shadowRoot.querySelector(
            '.generated-answer__content--scrollable'
          );

          expect(scrollableContainer).not.toBeNull();
        });

        it('should pass the engine, citation anchoring and the combined initial and follow-up answers to the thread', async () => {
          const element = createTestComponent({
            ...followUpOptions,
            disableCitationAnchoring: true,
          });
          await flushPromises();

          const thread = element.shadowRoot.querySelector(
            selectors.generatedAnswerThread
          );

          expect(thread.engineId).toBe(exampleEngineId);
          expect(thread.disableCitationAnchoring).toBe(true);
          expect(thread.generatedAnswers).toEqual([
            expect.objectContaining({
              answer: exampleAnswer,
              question: exampleQuery,
            }),
            ...exampleFollowUpAnswers,
          ]);
        });

        it('should ask a follow-up question when the follow-up input emits a submit event', async () => {
          const element = createTestComponent(followUpOptions);
          await flushPromises();

          const followUpInput = element.shadowRoot.querySelector(
            selectors.generatedAnswerFollowUpInput
          );
          const exampleFollowUpQuestion = 'example follow-up question';
          followUpInput.dispatchEvent(
            new CustomEvent('quantic__submitfollowup', {
              detail: {value: exampleFollowUpQuestion},
            })
          );

          expect(functionsMocks.askFollowUp).toHaveBeenCalledTimes(1);
          expect(functionsMocks.askFollowUp).toHaveBeenCalledWith(
            exampleFollowUpQuestion
          );
        });

        it('should disable the follow-up submit button while an answer is being generated', async () => {
          generatedAnswerState = {...generatedAnswerState, isStreaming: true};
          const element = createTestComponent(followUpOptions);
          await flushPromises();

          const followUpInput = element.shadowRoot.querySelector(
            selectors.generatedAnswerFollowUpInput
          );

          expect(followUpInput.submitButtonDisabled).toBe(true);
        });

        it('should ignore the collapsible feature and not render the single answer collapse toggle', async () => {
          mockAnswerHeight = defaultAnswerHeight + 100;
          const element = createTestComponent({
            ...followUpOptions,
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

      describe('when follow-ups are not enabled', () => {
        it('should render the single answer body instead of the conversation thread', async () => {
          const element = createTestComponent();
          await flushPromises();

          const singleAnswerBody = element.shadowRoot.querySelector(
            selectors.generatedAnswerBody
          );
          const thread = element.shadowRoot.querySelector(
            selectors.generatedAnswerThread
          );

          expect(singleAnswerBody).not.toBeNull();
          expect(thread).toBeNull();
        });
      });
    });

    describe('when the answer cannot be generated after a query is executed', () => {
      const exampleEmptyAnswer = '';
      const exampleAnswerContentFormat = 'text/markdown';
      beforeEach(() => {
        generatedAnswerState = {
          ...initialGeneratedAnswerState,
          isStreaming: false,
          answer: exampleEmptyAnswer,
          answerContentFormat: exampleAnswerContentFormat,
          cannotAnswer: true,
        };
        searchStatusState = {
          ...initialSearchStatusState,
          hasResults: true,
        };
        mockSuccessfulHeadlessInitialization();
        prepareHeadlessState();
      });

      afterAll(() => {
        generatedAnswerState = initialGeneratedAnswerState;
      });

      describe('when no custom error message slot is provided', () => {
        it('should not display the generated answer card', async () => {
          const element = createTestComponent();
          await flushPromises();

          const generatedAnswerCard = element.shadowRoot.querySelector(
            selectors.generatedAnswerCard
          );
          expect(generatedAnswerCard).toBeNull();

          const generatedAnswerCardNoAnswer = element.shadowRoot.querySelector(
            selectors.generatedAnswerNoAnswerCard
          );
          expect(generatedAnswerCardNoAnswer).toBeNull();
        });
      });

      describe('when a custom error message slot is provided', () => {
        it('should properly display the no generated answer card', async () => {
          const element = createTestComponent(
            defaultOptions,
            exampleAssignedElements
          );
          await flushPromises();

          const generatedAnswerCard = element.shadowRoot.querySelector(
            selectors.generatedAnswerCard
          );
          expect(generatedAnswerCard).toBeNull();

          const generatedAnswerCardNoAnswer = element.shadowRoot.querySelector(
            selectors.generatedAnswerNoAnswerCard
          );
          expect(generatedAnswerCardNoAnswer).not.toBeNull();
        });
      });

      describe('when no results are returned', () => {
        beforeEach(() => {
          searchStatusState = {
            ...initialSearchStatusState,
            hasResults: false,
          };
        });

        it('should not display the generated answer or the no generated answer card', async () => {
          const element = createTestComponent(
            defaultOptions,
            exampleAssignedElements
          );
          await flushPromises();

          const generatedAnswerCard = element.shadowRoot.querySelector(
            selectors.generatedAnswerCard
          );
          expect(generatedAnswerCard).toBeNull();

          const generatedAnswerCardNoAnswer = element.shadowRoot.querySelector(
            selectors.generatedAnswerNoAnswerCard
          );
          expect(generatedAnswerCardNoAnswer).toBeNull();
        });
      });
    });

    describe('automatic answer generation', () => {
      describe('when the answer is loading', () => {
        const exampleAnswerContentFormat = 'text/markdown';
        beforeEach(() => {
          generatedAnswerState = {
            ...initialGeneratedAnswerState,
            isStreaming: false,
            answer: '',
            answerContentFormat: exampleAnswerContentFormat,
            answerGenerationMode: 'automatic',
            isLoading: true,
          };
          mockSuccessfulHeadlessInitialization();
          prepareHeadlessState();
        });

        afterAll(() => {
          generatedAnswerState = initialGeneratedAnswerState;
        });

        it('should not display the loading state', async () => {
          const element = createTestComponent();
          await flushPromises();

          const loadingSpinner = element.shadowRoot.querySelector(
            selectors.loadingSpinner
          );
          const generatedAnswerCard = element.shadowRoot.querySelector(
            selectors.generatedAnswerCard
          );
          expect(loadingSpinner).toBeNull();
          expect(generatedAnswerCard).toBeNull();
        });
      });

      describe('when the answer cannot be generated after a query is executed', () => {
        const exampleAnswerContentFormat = 'text/markdown';
        beforeEach(() => {
          generatedAnswerState = {
            ...initialGeneratedAnswerState,
            isStreaming: false,
            isLoading: false,
            answer: '',
            answerContentFormat: exampleAnswerContentFormat,
            answerGenerationMode: 'automatic',
            cannotAnswer: true,
          };
          searchStatusState = {
            ...initialSearchStatusState,
            hasResults: true,
          };
          mockSuccessfulHeadlessInitialization();
          prepareHeadlessState();
        });

        afterAll(() => {
          generatedAnswerState = initialGeneratedAnswerState;
        });

        describe('when no custom error message slot is provided', () => {
          it('should not display the cannot answer message', async () => {
            const element = createTestComponent();
            await flushPromises();

            const generatedAnswerCardNoAnswer =
              element.shadowRoot.querySelector(
                selectors.generatedAnswerNoAnswerCard
              );
            const generatedAnswerCard = element.shadowRoot.querySelector(
              selectors.generatedAnswerCard
            );
            expect(generatedAnswerCard).toBeNull();
            expect(generatedAnswerCardNoAnswer).toBeNull();
          });
        });

        describe('when a custom error message slot is provided', () => {
          it('should display the cannot answer message', async () => {
            const element = createTestComponent(
              defaultOptions,
              exampleAssignedElements
            );
            await flushPromises();

            const generatedAnswerCardNoAnswer =
              element.shadowRoot.querySelector(
                selectors.generatedAnswerNoAnswerCard
              );
            const generatedAnswerCard = element.shadowRoot.querySelector(
              selectors.generatedAnswerCard
            );
            expect(generatedAnswerCard).toBeNull();
            expect(generatedAnswerCardNoAnswer).not.toBeNull();
          });
        });

        describe('when no results are returned', () => {
          beforeEach(() => {
            searchStatusState = {
              ...initialSearchStatusState,
              hasResults: false,
            };
          });

          it('should not display the generated answer or the no generated answer card', async () => {
            const element = createTestComponent(
              defaultOptions,
              exampleAssignedElements
            );
            await flushPromises();

            const generatedAnswerCard = element.shadowRoot.querySelector(
              selectors.generatedAnswerCard
            );
            expect(generatedAnswerCard).toBeNull();

            const generatedAnswerCardNoAnswer =
              element.shadowRoot.querySelector(
                selectors.generatedAnswerNoAnswerCard
              );
            expect(generatedAnswerCardNoAnswer).toBeNull();
          });
        });
      });
    });

    describe('manual answer generation', () => {
      describe('when the answer is loading', () => {
        const exampleAnswerContentFormat = 'text/markdown';
        beforeEach(() => {
          generatedAnswerState = {
            ...initialGeneratedAnswerState,
            isStreaming: false,
            answer: '',
            answerContentFormat: exampleAnswerContentFormat,
            answerGenerationMode: 'manual',
            isLoading: true,
          };
          mockSuccessfulHeadlessInitialization();
          prepareHeadlessState();
        });

        afterAll(() => {
          generatedAnswerState = initialGeneratedAnswerState;
        });

        it('should display the loading state', async () => {
          const element = createTestComponent();
          await flushPromises();

          const loadingSpinner = element.shadowRoot.querySelector(
            selectors.loadingSpinner
          );
          const generatedAnswerCard = element.shadowRoot.querySelector(
            selectors.generatedAnswerCard
          );
          expect(loadingSpinner).not.toBeNull();
          expect(generatedAnswerCard).toBeNull();
        });

        describe('when cannotAnswer is true in the state', () => {
          beforeEach(() => {
            generatedAnswerState = {
              ...initialGeneratedAnswerState,
              isStreaming: false,
              answer: '',
              answerContentFormat: exampleAnswerContentFormat,
              answerGenerationMode: 'manual',
              isLoading: true,
              cannotAnswer: true,
            };
            searchStatusState = {
              ...initialSearchStatusState,
              hasResults: true,
            };
            mockSuccessfulHeadlessInitialization();
            prepareHeadlessState();
          });

          afterAll(() => {
            generatedAnswerState = initialGeneratedAnswerState;
          });

          it('should display the cannot answer message and not display the loading state even when isLoading is true', async () => {
            const element = createTestComponent();
            await flushPromises();

            const loadingSpinner = element.shadowRoot.querySelector(
              selectors.loadingSpinner
            );
            const generatedAnswerCard = element.shadowRoot.querySelector(
              selectors.generatedAnswerCard
            );
            const generatedAnswerCardNoAnswer =
              element.shadowRoot.querySelector(
                selectors.generatedAnswerNoAnswerCard
              );
            const generatedAnswerCardNoAnswerMessage =
              element.shadowRoot.querySelector(
                selectors.generatedAnswerNoAnswerMessage
              );

            expect(loadingSpinner).toBeNull();
            expect(generatedAnswerCard).toBeNull();
            expect(generatedAnswerCardNoAnswer).not.toBeNull();
            expect(generatedAnswerCardNoAnswerMessage.textContent).toBe(
              'No generated answer available.'
            );
          });
        });
      });

      describe('when the answer cannot be generated after a query is executed', () => {
        const exampleAnswerContentFormat = 'text/markdown';
        beforeEach(() => {
          generatedAnswerState = {
            ...initialGeneratedAnswerState,
            isStreaming: false,
            isLoading: false,
            answer: '',
            answerContentFormat: exampleAnswerContentFormat,
            answerGenerationMode: 'manual',
            cannotAnswer: true,
          };
          searchStatusState = {
            ...initialSearchStatusState,
            hasResults: true,
          };
          mockSuccessfulHeadlessInitialization();
          prepareHeadlessState();
        });

        afterAll(() => {
          generatedAnswerState = initialGeneratedAnswerState;
        });

        describe('when no custom error message slot is provided', () => {
          it('should display the default cannot answer message', async () => {
            const element = createTestComponent();
            await flushPromises();

            const generatedAnswerCardNoAnswer =
              element.shadowRoot.querySelector(
                selectors.generatedAnswerNoAnswerCard
              );
            const generatedAnswerCardNoAnswerMessage =
              element.shadowRoot.querySelector(
                selectors.generatedAnswerNoAnswerMessage
              );
            const generatedAnswerCard = element.shadowRoot.querySelector(
              selectors.generatedAnswerCard
            );
            expect(generatedAnswerCard).toBeNull();
            expect(generatedAnswerCardNoAnswer).not.toBeNull();
            expect(generatedAnswerCardNoAnswerMessage.textContent).toBe(
              'No generated answer available.'
            );
          });
        });

        describe('when a custom error message slot is provided', () => {
          it('should properly display the cannot answer message', async () => {
            const element = createTestComponent(
              defaultOptions,
              exampleAssignedElements
            );
            await flushPromises();

            const generatedAnswerCardNoAnswer =
              element.shadowRoot.querySelector(
                selectors.generatedAnswerNoAnswerCard
              );
            const generatedAnswerCard = element.shadowRoot.querySelector(
              selectors.generatedAnswerCard
            );
            expect(generatedAnswerCard).toBeNull();
            expect(generatedAnswerCardNoAnswer).not.toBeNull();
          });
        });

        describe('when no results are returned', () => {
          beforeEach(() => {
            searchStatusState = {
              ...initialSearchStatusState,
              hasResults: false,
            };
          });

          it('should not display the generated answer or the no generated answer card', async () => {
            const element = createTestComponent(
              defaultOptions,
              exampleAssignedElements
            );
            await flushPromises();

            const generatedAnswerCard = element.shadowRoot.querySelector(
              selectors.generatedAnswerCard
            );
            expect(generatedAnswerCard).toBeNull();

            const generatedAnswerCardNoAnswer =
              element.shadowRoot.querySelector(
                selectors.generatedAnswerNoAnswerCard
              );
            expect(generatedAnswerCardNoAnswer).toBeNull();
          });
        });
      });
    });
  });

  describe('the generated answer feedback', () => {
    const exampleAnswer = 'answer generated successfully';
    const exampleAgentId = 'example agent id';

    describe.each([
      {
        action: 'like',
        threadEvent: 'quantic__generatedanswerlike',
        controllerMethod: 'like',
      },
      {
        action: 'dislike',
        threadEvent: 'quantic__generatedanswerdislike',
        controllerMethod: 'dislike',
      },
    ])(
      'when the user clicks the $action button',
      ({threadEvent, controllerMethod}) => {
        describe('when follow-ups are not enabled', () => {
          beforeEach(() => {
            generatedAnswerState = {
              ...initialGeneratedAnswerState,
              isStreaming: false,
              answer: exampleAnswer,
              answerContentFormat: 'text/markdown',
              answerId: exampleAnswerId,
              citations: exampleCitations,
            };
            mockSuccessfulHeadlessInitialization();
            prepareHeadlessState();
          });

          afterAll(() => {
            generatedAnswerState = initialGeneratedAnswerState;
          });

          it('should call the controller and open the feedback modal', async () => {
            const element = createTestComponent();
            await flushPromises();

            const generatedAnswerBody = element.shadowRoot.querySelector(
              selectors.generatedAnswerBodyComponent
            );
            generatedAnswerBody.dispatchEvent(
              new CustomEvent(threadEvent, {
                detail: {answerId: exampleAnswerId},
              })
            );
            await flushPromises();

            expect(functionsMocks[controllerMethod]).toHaveBeenCalledTimes(1);
            expect(functionsMocks[controllerMethod]).toHaveBeenCalledWith(
              exampleAnswerId
            );
            expect(FeedbackModalQna.open).toHaveBeenCalledTimes(1);
          });
        });

        describe('when follow-ups are enabled', () => {
          beforeEach(() => {
            generatedAnswerState = {
              ...initialGeneratedAnswerState,
              answer: exampleAnswer,
              followUpAnswers: {isEnabled: true, followUpAnswers: []},
            };
            mockSuccessfulHeadlessInitialization();
            prepareHeadlessState();
          });

          afterAll(() => {
            generatedAnswerState = initialGeneratedAnswerState;
          });

          it('should call the controller without opening the feedback modal', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              agentId: exampleAgentId,
            });
            await flushPromises();

            const thread = element.shadowRoot.querySelector(
              selectors.generatedAnswerThread
            );
            thread.dispatchEvent(
              new CustomEvent(threadEvent, {
                detail: {answerId: exampleAnswerId},
              })
            );
            await flushPromises();

            expect(functionsMocks[controllerMethod]).toHaveBeenCalledTimes(1);
            expect(functionsMocks[controllerMethod]).toHaveBeenCalledWith(
              exampleAnswerId
            );
            expect(FeedbackModalQna.open).not.toHaveBeenCalled();
          });
        });
      }
    );
  });
});
