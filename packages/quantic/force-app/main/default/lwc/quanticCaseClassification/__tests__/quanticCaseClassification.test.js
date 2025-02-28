/* eslint-disable no-import-assign */
// @ts-ignore
import QuanticCaseClassification from 'c/quanticCaseClassification';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {getPicklistValuesByRecordType} from 'lightning/uiObjectInfoApi';

jest.mock('c/quanticHeadlessLoader');

const exampleDefaultLabel = 'default label';
const incorrectSfFieldNameError = `The Salesforce field API name is not found.`;
const invalidMaxSuggestionsError =
  'The maximum number of suggestions must be an integer greater than 0.';
const missingCoveoFieldNameError =
  'The "coveoFieldName" property is required, please set its value.';
const exampleMoreTopicsLabel = 'example more topics label';
const exampleSelectOptionLabel = 'example select option label';
const exampleField = 'example field';
const exampleLabel = 'example label';

const exampleCaseClassificationSuggestions = [
  {
    id: '1',
    value: 'classification 2',
    confidence: 1,
  },
  {
    id: '2',
    value: 'classification 3',
    confidence: 1,
  },
];

const exampleCaseClassificationAllOptions = [
  {value: 'classification 1'},
  {value: 'classification 2'},
  {value: 'classification 3'},
  {value: 'classification 4'},
];

jest.mock(
  '@salesforce/label/c.quantic_CaseClassificationTitle',
  () => ({default: exampleDefaultLabel}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_InvalidMaxNumberOfSuggestions',
  () => ({default: invalidMaxSuggestionsError}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_InvalidMaxNumberOfSuggestions',
  () => ({default: invalidMaxSuggestionsError}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_PropertyIsRequired',
  () => ({default: missingCoveoFieldNameError}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_MoreTopics',
  () => ({default: exampleMoreTopicsLabel}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_SelectOption',
  () => ({default: exampleSelectOptionLabel}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_SalesforceFieldNotFound',
  () => ({default: incorrectSfFieldNameError}),
  {
    virtual: true,
  }
);

let isInitialized = false;

const initialCaseClassificationState = {
  suggestions: exampleCaseClassificationSuggestions,
};
let caseClassificationState = initialCaseClassificationState;

const functionsMocks = {
  buildCaseField: jest.fn(() => ({
    state: caseClassificationState,
    subscribe: functionsMocks.subscribe,
    update: functionsMocks.update,
  })),
  subscribe: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribe;
  }),
  unsubscribe: jest.fn(() => {}),
  loadCaseAssistAnalyticsActions: jest.fn(() => ({
    fetchCaseClassifications: functionsMocks.fetchCaseClassifications,
  })),
  loadCaseFieldActions: jest.fn(() => {}),
  update: jest.fn(() => {}),
  fetchCaseClassifications: jest.fn(() => {}),
  dispatch: jest.fn(() => {}),
};

const exampleEngine = {
  id: 'exampleEngineId',
  dispatch: functionsMocks.dispatch,
};

const defaultOptions = {
  engineId: exampleEngine.id,
  sfFieldApiName: exampleField,
  coveoFieldName: exampleField,
  maxSuggestions: 3,
  label: exampleLabel,
};

const selectors = {
  initializationError: 'c-quantic-component-error',
  loadingSpinner: 'lightning-spinner',
  label: '[data-testid="case-classification-label"]',
  caseClassificationSuggestion:
    '[data-testid="case-classification-suggestion"]',
  caseClassificationOption: '[data-testid="case-classification-option"]',
  caseClassificationSuggestionInput:
    '[data-testid="case-classification-suggestion"] input',
  caseClassificationOptionInput:
    '[data-testid="case-classification-option"] input',
  showSelectInputButton: '[data-testid="show-select-input-button"]',
  allOptionsSelectInput:
    '[data-testid="case-classification-all-options-combobox"]',
  classificationErrorMessage:
    '[data-testid="case-classification-error-message"]',
};

function mockGetPicklistValuesByRecordTypeWire() {
  // @ts-ignore
  // eslint-disable-next-line @lwc/lwc/no-unexpected-wire-adapter-usages
  getPicklistValuesByRecordType.emit({
    picklistFieldValues: {
      [exampleField]: {
        values: exampleCaseClassificationAllOptions,
      },
    },
  });
}

function createTestComponent(options = defaultOptions) {
  prepareHeadlessState();

  const element = createElement('c-quantic-case-classification', {
    is: QuanticCaseClassification,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }
  document.body.appendChild(element);
  return element;
}

function prepareHeadlessState() {
  // @ts-ignore
  global.CoveoHeadlessCaseAssist = {
    buildCaseField: functionsMocks.buildCaseField,
    loadCaseAssistAnalyticsActions:
      functionsMocks.loadCaseAssistAnalyticsActions,
    loadCaseFieldActions: functionsMocks.loadCaseFieldActions,
  };
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticCaseClassification && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticCaseClassification) {
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

describe('c-quantic-case-classification', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    caseClassificationState = initialCaseClassificationState;
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

  describe('controller initialization', () => {
    it('should build the case field controller with the proper parameters', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildCaseField).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildCaseField).toHaveBeenCalledWith(
        exampleEngine,
        {
          options: {
            field: exampleField,
          },
        }
      );
    });

    it('should subscribe to the headless case field state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.subscribe).toHaveBeenCalledTimes(1);
    });

    describe('the fetchOnInit property', () => {
      it('should fetch case classifications when the fetchOnInit property is set to true', async () => {
        createTestComponent({...defaultOptions, fetchOnInit: true});
        await flushPromises();

        expect(functionsMocks.fetchCaseClassifications).toHaveBeenCalledTimes(
          1
        );
      });

      it('should not fetch case classifications when the fetchOnInit property is set to false', async () => {
        createTestComponent({...defaultOptions, fetchOnInit: false});
        await flushPromises();

        expect(functionsMocks.fetchCaseClassifications).toHaveBeenCalledTimes(
          0
        );
      });
    });
  });

  describe('when the component is loading', () => {
    beforeEach(() => {
      caseClassificationState = {
        ...initialCaseClassificationState,
        loading: true,
      };
    });

    it('should display the loading spinner', async () => {
      const element = createTestComponent();
      await flushPromises();

      const loadingSpinner = element.shadowRoot.querySelector(
        selectors.loadingSpinner
      );
      const label = element.shadowRoot.querySelector(selectors.label);

      expect(loadingSpinner).not.toBeNull();
      expect(label).not.toBeNull();
      expect(label.textContent).toBe(exampleLabel);
    });
  });

  describe('property validation', () => {
    describe('when the value of the property maxSuggestions is inferior to 0', () => {
      it('should display the initialization error component', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          maxSuggestions: -1,
        });
        await flushPromises();

        const initializationError = element.shadowRoot.querySelector(
          selectors.initializationError
        );

        expect(initializationError).not.toBeNull();
        expect(initializationError.message).toBe(invalidMaxSuggestionsError);
      });
    });

    describe('when the value of the property coveoFieldName is not defined', () => {
      it('should display the initialization error component', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          coveoFieldName: undefined,
        });
        await flushPromises();

        const initializationError = element.shadowRoot.querySelector(
          selectors.initializationError
        );

        expect(initializationError).not.toBeNull();
        expect(initializationError.message).toBe(missingCoveoFieldNameError);
      });
    });

    describe('when the value of the property sfFieldApiName does not exist on the case object', () => {
      it('should display the initialization error component', async () => {
        const exampleInvalidSfField = 'example invalid field';
        const element = createTestComponent({
          ...defaultOptions,
          sfFieldApiName: exampleInvalidSfField,
        });
        mockGetPicklistValuesByRecordTypeWire();
        await flushPromises();

        const initializationError = element.shadowRoot.querySelector(
          selectors.initializationError
        );

        expect(initializationError).not.toBeNull();
        expect(initializationError.message).toBe(incorrectSfFieldNameError);
      });
    });
  });

  describe('the behaviour of the case classifications inputs', () => {
    describe('when the max suggestions value is inferior to the count of all the classification options', () => {
      const exampleMaxSuggestions = 2;

      describe('the case classification suggestions', () => {
        it('should display the case classification suggestions as inline options', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            maxSuggestions: exampleMaxSuggestions,
          });
          mockGetPicklistValuesByRecordTypeWire();

          await flushPromises();

          const suggestions = element.shadowRoot.querySelectorAll(
            selectors.caseClassificationSuggestion
          );

          expect(suggestions.length).toBe(exampleMaxSuggestions);
          for (let index = 0; index < exampleMaxSuggestions; index++) {
            expect(suggestions[index].textContent).toBe(
              exampleCaseClassificationSuggestions[index].value
            );
          }
        });

        it('should automatically select the first case classification suggestion', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            maxSuggestions: exampleMaxSuggestions,
          });
          mockGetPicklistValuesByRecordTypeWire();

          await flushPromises();

          const suggestionInputs = element.shadowRoot.querySelectorAll(
            selectors.caseClassificationSuggestionInput
          );

          expect(functionsMocks.update).toHaveBeenCalledTimes(1);
          expect(functionsMocks.update).toHaveBeenCalledWith(
            exampleCaseClassificationSuggestions[0].value,
            {caseClassifications: false, documentSuggestions: false},
            true
          );
          expect(suggestionInputs[0].checked).toBe(true);
        });

        describe('when a case classification suggestion is clicked', () => {
          it('should call the update method of the case field controller with the right parameter', async () => {
            const automaticallySelectedSuggestionIndex = 0;
            const exampleSelectedSuggestionIndex = 1;
            const element = createTestComponent({
              ...defaultOptions,
              maxSuggestions: exampleMaxSuggestions,
            });
            mockGetPicklistValuesByRecordTypeWire();

            await flushPromises();

            expect(functionsMocks.update).toHaveBeenCalledTimes(1);
            expect(functionsMocks.update).toHaveBeenCalledWith(
              exampleCaseClassificationSuggestions[
                automaticallySelectedSuggestionIndex
              ].value,
              {caseClassifications: false, documentSuggestions: false},
              true
            );

            const suggestionInputs = element.shadowRoot.querySelectorAll(
              selectors.caseClassificationSuggestionInput
            );

            suggestionInputs[exampleSelectedSuggestionIndex].click();
            await flushPromises();

            expect(functionsMocks.update).toHaveBeenCalledTimes(2);
            expect(functionsMocks.update).toHaveBeenCalledWith(
              exampleCaseClassificationSuggestions[
                exampleSelectedSuggestionIndex
              ].value,
              {caseClassifications: false, documentSuggestions: false},
              undefined
            );
          });
        });
      });

      describe('the case classification all options', () => {
        it('should display the show select input button', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            maxSuggestions: exampleMaxSuggestions,
          });
          mockGetPicklistValuesByRecordTypeWire();

          await flushPromises();

          const showSelectInputButton = element.shadowRoot.querySelector(
            selectors.showSelectInputButton
          );

          expect(showSelectInputButton).not.toBeNull();
          expect(showSelectInputButton.title).toBe(exampleMoreTopicsLabel);
          expect(showSelectInputButton.label).toBe(exampleMoreTopicsLabel);
        });

        describe('when clicking the show select input button', () => {
          it('should display the all options select input', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              maxSuggestions: exampleMaxSuggestions,
            });
            mockGetPicklistValuesByRecordTypeWire();

            await flushPromises();

            const showSelectInputButton = element.shadowRoot.querySelector(
              selectors.showSelectInputButton
            );
            showSelectInputButton.click();
            await flushPromises();

            const allOptionsSelectInput = element.shadowRoot.querySelector(
              selectors.allOptionsSelectInput
            );

            expect(allOptionsSelectInput).not.toBeNull();
            expect(allOptionsSelectInput.options).toStrictEqual(
              exampleCaseClassificationAllOptions
            );
            expect(allOptionsSelectInput.value).toBe(
              exampleCaseClassificationSuggestions[0].value
            );
            expect(allOptionsSelectInput.placeholder).toBe(
              exampleMoreTopicsLabel
            );
          });

          it('should select an option correctly from the all options select input', async () => {
            const exampleSelectedOptionIndex = 3;

            const element = createTestComponent({
              ...defaultOptions,
              maxSuggestions: exampleMaxSuggestions,
            });
            mockGetPicklistValuesByRecordTypeWire();

            await flushPromises();

            const showSelectInputButton = element.shadowRoot.querySelector(
              selectors.showSelectInputButton
            );
            showSelectInputButton.click();
            await flushPromises();

            const allOptionsSelectInput = element.shadowRoot.querySelector(
              selectors.allOptionsSelectInput
            );

            expect(allOptionsSelectInput).not.toBeNull();
            allOptionsSelectInput.value =
              exampleCaseClassificationAllOptions[
                exampleSelectedOptionIndex
              ].value;
            allOptionsSelectInput.dispatchEvent(new CustomEvent('change'));

            expect(functionsMocks.update).toHaveBeenCalledTimes(2);
            expect(functionsMocks.update).toHaveBeenCalledWith(
              exampleCaseClassificationAllOptions[exampleSelectedOptionIndex]
                .value,
              {caseClassifications: false, documentSuggestions: false},
              undefined
            );
          });
        });
      });
    });

    describe('when the max suggestions value is superior to the count of all the classification options', () => {
      const exampleMaxSuggestions = 6;

      describe('the case classification suggestions', () => {
        it('should display the case classification suggestions as inline options', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            maxSuggestions: exampleMaxSuggestions,
          });
          mockGetPicklistValuesByRecordTypeWire();

          await flushPromises();

          const suggestions = element.shadowRoot.querySelectorAll(
            selectors.caseClassificationSuggestion
          );

          expect(suggestions.length).toBe(
            exampleCaseClassificationSuggestions.length
          );

          exampleCaseClassificationSuggestions.forEach(
            ({value: expectedValue}, index) =>
              expect(suggestions[index].textContent).toBe(expectedValue)
          );
        });

        it('should automatically select the first case classification suggestion', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            maxSuggestions: exampleMaxSuggestions,
          });
          mockGetPicklistValuesByRecordTypeWire();

          await flushPromises();

          const suggestionInputs = element.shadowRoot.querySelectorAll(
            selectors.caseClassificationSuggestionInput
          );

          expect(functionsMocks.update).toHaveBeenCalledTimes(1);
          expect(functionsMocks.update).toHaveBeenCalledWith(
            exampleCaseClassificationSuggestions[0].value,
            {caseClassifications: false, documentSuggestions: false},
            true
          );
          expect(suggestionInputs[0].checked).toBe(true);
        });
      });

      describe('the case classification remaining options', () => {
        const remainingOptions = exampleCaseClassificationAllOptions.filter(
          (option) =>
            !exampleCaseClassificationSuggestions.some(
              (suggestion) => suggestion.value === option.value
            )
        );

        beforeEach(() => {
          caseClassificationState = {
            ...initialCaseClassificationState,
            suggestions: exampleCaseClassificationSuggestions,
          };
        });

        it('should not display the all options select input', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            maxSuggestions: exampleMaxSuggestions,
          });
          mockGetPicklistValuesByRecordTypeWire();

          await flushPromises();

          const showSelectInputButton = element.shadowRoot.querySelector(
            selectors.showSelectInputButton
          );
          const allOptionsSelectInput = element.shadowRoot.querySelector(
            selectors.allOptionsSelectInput
          );

          expect(showSelectInputButton).toBeNull();
          expect(allOptionsSelectInput).toBeNull();
        });

        it('should display the case classification remaining options as inline options', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            maxSuggestions: exampleMaxSuggestions,
          });
          mockGetPicklistValuesByRecordTypeWire();

          await flushPromises();

          const options = element.shadowRoot.querySelectorAll(
            selectors.caseClassificationOption
          );
          const expectedOptionsCount =
            exampleCaseClassificationAllOptions.length -
            exampleCaseClassificationSuggestions.length;

          expect(options.length).toBe(expectedOptionsCount);
          remainingOptions.forEach(({value: expectedValue}, index) =>
            expect(options[index].textContent).toBe(expectedValue)
          );
        });

        describe('when a case classification remaining options is clicked', () => {
          it('should call the update method of the case field controller with the right parameter', async () => {
            const automaticallySelectedSuggestionIndex = 0;
            const exampleSelectedSuggestionIndex = 1;
            const element = createTestComponent({
              ...defaultOptions,
              maxSuggestions: exampleMaxSuggestions,
            });
            mockGetPicklistValuesByRecordTypeWire();

            await flushPromises();

            expect(functionsMocks.update).toHaveBeenCalledTimes(1);
            expect(functionsMocks.update).toHaveBeenCalledWith(
              exampleCaseClassificationSuggestions[
                automaticallySelectedSuggestionIndex
              ].value,
              {caseClassifications: false, documentSuggestions: false},
              true
            );

            const optionInputs = element.shadowRoot.querySelectorAll(
              selectors.caseClassificationOptionInput
            );

            optionInputs[exampleSelectedSuggestionIndex].click();
            await flushPromises();

            expect(functionsMocks.update).toHaveBeenCalledTimes(2);
            expect(functionsMocks.update).toHaveBeenCalledWith(
              remainingOptions[exampleSelectedSuggestionIndex].value,
              {caseClassifications: false, documentSuggestions: false},
              undefined
            );
          });
        });
      });
    });

    describe('when no case classification suggestions are found', () => {
      beforeEach(() => {
        caseClassificationState = {
          ...initialCaseClassificationState,
          suggestions: [],
        };
      });

      it('should not display any case classification suggestions, but still display the options select input', async () => {
        const element = createTestComponent();
        mockGetPicklistValuesByRecordTypeWire();

        await flushPromises();

        const suggestions = element.shadowRoot.querySelectorAll(
          selectors.caseClassificationSuggestion
        );
        expect(suggestions.length).toBe(0);

        const showSelectInputButton = element.shadowRoot.querySelector(
          selectors.showSelectInputButton
        );
        expect(showSelectInputButton).toBeNull();

        const allOptionsSelectInput = element.shadowRoot.querySelector(
          selectors.allOptionsSelectInput
        );

        expect(allOptionsSelectInput).not.toBeNull();
        expect(allOptionsSelectInput.options).toStrictEqual(
          exampleCaseClassificationAllOptions
        );
        expect(allOptionsSelectInput.value).not.toBeDefined();
        expect(allOptionsSelectInput.placeholder).toBe(exampleMoreTopicsLabel);
      });
    });
  });

  describe('the reportValidity public method', () => {
    describe('when the property required is set to true', () => {
      it('should display a validity error when reportValidity is called and no value is selected', async () => {
        caseClassificationState = {
          ...initialCaseClassificationState,
          suggestions: [],
        };
        const element = createTestComponent({
          ...defaultOptions,
          required: true,
        });
        mockGetPicklistValuesByRecordTypeWire();
        await flushPromises();

        element.reportValidity();
        await flushPromises();

        const classificationErrorMessage = element.shadowRoot.querySelector(
          selectors.classificationErrorMessage
        );

        expect(classificationErrorMessage).not.toBeNull();
        expect(classificationErrorMessage.textContent).toBe(
          exampleSelectOptionLabel
        );
      });

      it('should not display a validity error when reportValidity is called and a value is selected', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          required: true,
        });
        mockGetPicklistValuesByRecordTypeWire();
        await flushPromises();

        element.reportValidity();
        await flushPromises();

        const classificationErrorMessage = element.shadowRoot.querySelector(
          selectors.classificationErrorMessage
        );

        expect(classificationErrorMessage).toBeNull();
      });
    });

    describe('when the property required is set to false', () => {
      it('should not display a validity error when reportValidity is called and no value is selected', async () => {
        caseClassificationState = {
          ...initialCaseClassificationState,
          suggestions: [],
        };
        const element = createTestComponent({
          ...defaultOptions,
          required: false,
        });
        mockGetPicklistValuesByRecordTypeWire();
        await flushPromises();

        element.reportValidity();
        await flushPromises();

        const classificationErrorMessage = element.shadowRoot.querySelector(
          selectors.classificationErrorMessage
        );

        expect(classificationErrorMessage).toBeNull();
      });

      it('should not display a validity error when reportValidity is called and a value is selected', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          required: false,
        });
        mockGetPicklistValuesByRecordTypeWire();
        await flushPromises();

        element.reportValidity();
        await flushPromises();

        const classificationErrorMessage = element.shadowRoot.querySelector(
          selectors.classificationErrorMessage
        );

        expect(classificationErrorMessage).toBeNull();
      });
    });
  });
});
