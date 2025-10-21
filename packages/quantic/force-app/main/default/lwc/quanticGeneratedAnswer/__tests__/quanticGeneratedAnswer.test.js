/* eslint-disable no-import-assign */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticGeneratedAnswer from 'c/quanticGeneratedAnswer';
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
jest.mock(
  '@salesforce/label/c.quantic_NoGeneratedAnswer',
  () => ({default: 'No generated answer available.'}),
  {
    virtual: true,
  }
);

/** @type {Object} */
const defaultOptions = {
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
  generatedAnswer: '[data-testid="generated-answer__answer"]',
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
  generatedAnswerNoAnswerCard:
    '[data-testid="generated-answer__no-answer-card"]',
  generatedAnswerNoAnswerMessage:
    '[data-testid="generated-answer__no-answer-message"]',
  generatedAnswerCitations: 'c-quantic-source-citations',
  loadingSpinner: 'lightning-spinner',
};

const initialSearchStatusState = {
  hasError: false,
};
let searchStatusState = initialSearchStatusState;

const initialGeneratedAnswerState = {isVisible: true, cannotAnswer: false};
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

const exampleEngine = {
  id: 'dummy engine',
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

      it('should pass the disableCitationAnchoring property to the source citations component', async () => {
        const element = createTestComponent();
        await flushPromises();

        const generatedAnswerCitations = element.shadowRoot.querySelector(
          selectors.generatedAnswerCitations
        );
        expect(generatedAnswerCitations).not.toBeNull();
        expect(generatedAnswerCitations.disableCitationAnchoring).toBe(false);
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
});
