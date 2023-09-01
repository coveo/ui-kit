import {fetchClassifications} from '../../../page-objects/actions/action-fetch-classifications';
import {
  interceptCaseAssist,
  mockCaseClassification,
  mockSfPicklistValues,
  interceptClassificationsIndefinitely,
  interceptDocumentSuggestion,
} from '../../../page-objects/case-assist';
import {configure} from '../../../page-objects/configurator';
import {scope} from '../../../reporters/detailed-collector';
import {stubConsoleWarning} from '../../console-selectors';
import {CaseClassificationActions as Actions} from './case-classification-actions';
import {CaseClassificationExpectations as Expect} from './case-classification-expectations';

interface CaseClassificationOptions {
  maxSuggestions: number;
  label: string;
  required: boolean;
  selectPlaceholder: string;
  messageWhenValueMissing: string;
  sfFieldApiName: string;
  coveoFieldName: string;
  fetchClassificationOnChange: boolean;
  fetchDocumentSuggestionOnChange: boolean;
  fetchOnInit: boolean;
}

const incorrectSfFielNameError = (value: string) => {
  return `The Salesforce field API name "${value}" is not found.`;
};
const invalidMaxSuggestionsError =
  'The maximum number of suggestions must be an integer greater than 0.';
const missingCoveoFieldNameError =
  'The "coveoFieldName" property is required, please set its value.';
const nonCorrespondingSuggestionWarning = (
  value: string,
  coveoFieldName: string,
  sfFieldApiName: string
) => {
  return `The value "${value}" was not found among all the options retrieved from Salesforce. Ensure that the Coveo field name "${coveoFieldName}" corresponds to the correct Salesforce field name "${sfFieldApiName}".`;
};

describe('quantic-case-classification', () => {
  const pageUrl = 's/quantic-case-classification';

  const sfDefaultField = 'Priority';
  const coveoDefaultField = 'sfpriority';
  const nonCorrespondingCoveoField = 'sforigin';
  const allOptions = [
    {id: '0', value: 'Very low', label: 'Very low'},
    {id: '1', value: 'Low', label: 'Low'},
    {id: '2', value: 'Medium', label: 'Medium'},
    {id: '3', value: 'High', label: 'High'},
    {id: '4', value: 'Very high', label: 'Very high'},
  ];
  const nonCorrespondingSuggestions = [
    {id: '0', value: 'Web', label: 'Web'},
    {id: '1', value: 'Phone', label: 'Phone'},
  ];

  function visitCaseClassification(
    options: Partial<CaseClassificationOptions>
  ) {
    mockSfPicklistValues(sfDefaultField, allOptions);
    interceptCaseAssist();
    cy.visit(pageUrl);
    configure(options);
  }

  describe('when using default options', () => {
    it('should render the component and all parts', () => {
      visitCaseClassification({});

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
      });

      scope('when fetching suggestions', () => {
        const suggestionsCount = 3;
        const firstSuggestionIndex = 0;

        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(true);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.correctSuggestionsOrder(allOptions.slice(0, suggestionsCount));
        Expect.numberOfInlineOptions(0);
        Expect.logClickedSuggestion(firstSuggestionIndex, true);
        Expect.correctValue(allOptions[firstSuggestionIndex].value);
      });

      scope('when selecting a suggestion', () => {
        const clickedIndex = 1;

        Actions.clickSuggestion(clickedIndex);
        Expect.logClickedSuggestion(clickedIndex);
        Expect.logUpdatedClassificationFromSuggestion(
          coveoDefaultField,
          clickedIndex
        );
        Expect.correctValue(allOptions[clickedIndex].value);
      });

      scope('when selecting an option from the select input', () => {
        const clickedIndex = 3;

        Actions.clickSelectTitle();
        Actions.openSelectInput();
        Actions.clickSelectOption(clickedIndex);
        Expect.hideSuggestions(true);
        Expect.logUpdatedClassificationFromSelectOption(
          coveoDefaultField,
          clickedIndex
        );
        Expect.correctValue(allOptions[clickedIndex].value);
      });
    });
  });

  describe('when the suggestions are loading', () => {
    it('should display the loading spinner', () => {
      visitCaseClassification({});

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
      });

      scope('when fetching suggestions', () => {
        const suggestionsCount = 2;
        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        interceptClassificationsIndefinitely();
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(0);
        Expect.numberOfInlineOptions(0);
        Expect.displayLoading(true);
      });
    });
  });

  describe('when no suggestions are found', () => {
    it('should display only the select dropdown', () => {
      visitCaseClassification({});

      scope('when loading the page', () => {
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
      });

      scope('when fetching suggestions', () => {
        mockCaseClassification(coveoDefaultField, []);
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
        Expect.numberOfSuggestions(0);
        Expect.numberOfInlineOptions(0);
      });
    });
  });

  describe('when maxSuggestions set to 1', () => {
    it('should display only one suggestion and the select dropdown', () => {
      visitCaseClassification({
        maxSuggestions: 1,
      });

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
      });

      scope('when fetching suggestions', () => {
        const suggestionsCount = 2;
        const firstSuggestionIndex = 0;

        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.numberOfSuggestions(1);
        Expect.numberOfInlineOptions(0);
        Expect.displaySelectInput(false);
        Expect.displaySelectTitle(true);
        Expect.logClickedSuggestion(firstSuggestionIndex, true);
        Expect.correctValue(allOptions[firstSuggestionIndex].value);
      });

      scope('when selecting an option from the select input', () => {
        const clickedIndex = 3;

        Actions.clickSelectTitle();
        Actions.openSelectInput();
        Actions.clickSelectOption(clickedIndex);
        Expect.logUpdatedClassificationFromSelectOption(
          coveoDefaultField,
          clickedIndex
        );
        Expect.correctValue(allOptions[clickedIndex].value);
      });
    });
  });

  describe('when maxSuggestions is equal or inferior to 0', () => {
    it('should display only the select dropdown when maxSuggestions is set to 0', () => {
      visitCaseClassification({
        maxSuggestions: 0,
      });

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
      });

      scope('when fetching suggestions', () => {
        const suggestionsCount = 2;
        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.numberOfSuggestions(0);
        Expect.numberOfInlineOptions(0);
        Expect.displaySelectInput(true);
      });

      scope('when selecting an option from the select input', () => {
        const clickedIndex = 3;

        Actions.openSelectInput();
        Actions.clickSelectOption(clickedIndex);
        Expect.logUpdatedClassificationFromSelectOption(
          coveoDefaultField,
          clickedIndex
        );
        Expect.correctValue(allOptions[clickedIndex].value);
      });
    });

    it('should render an error message when maxSuggestion is inferior to 0', () => {
      const invalidValue = -1;
      visitCaseClassification({
        maxSuggestions: invalidValue,
      });

      scope('when loading the page', () => {
        Expect.displayLabel(false);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(false);
        Expect.displayComponentError(true);
        Expect.displayComponentErrorMessage(invalidMaxSuggestionsError);
      });
    });
  });

  describe('when maxSuggestions is not a number', () => {
    it('should render an error message', () => {
      visitCaseClassification({
        maxSuggestions: NaN,
      });

      scope('when loading the page', () => {
        Expect.displayLabel(false);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(false);
        Expect.displayComponentError(true);
        Expect.displayComponentErrorMessage(invalidMaxSuggestionsError);
      });
    });
  });

  describe('when maxSuggestions is set to the number of options', () => {
    const optionsCount = 5;
    const suggestionsCount = 2;
    it('should display all the options as inline options', () => {
      visitCaseClassification({
        maxSuggestions: optionsCount,
      });

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(optionsCount);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(false);
      });

      scope('when fetching suggestions', () => {
        const firstSuggestionIndex = 0;

        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.numberOfInlineOptions(allOptions.length - suggestionsCount);
        Expect.displaySelectInput(false);
        Expect.logClickedSuggestion(firstSuggestionIndex, true);
        Expect.correctValue(allOptions[firstSuggestionIndex].value);
      });

      scope('when selecting a suggestion', () => {
        const clickedIndex = 1;

        Actions.clickSuggestion(clickedIndex);
        Expect.logClickedSuggestion(clickedIndex);
        Expect.logUpdatedClassificationFromSuggestion(
          coveoDefaultField,
          clickedIndex
        );
        Expect.correctValue(allOptions[clickedIndex].value);
      });

      scope('when selecting an inline option', () => {
        const clickedIndex = 0;

        Actions.clickInlineOption(clickedIndex);
        Expect.logUpdatedClassificationFromInlineOption(
          coveoDefaultField,
          clickedIndex
        );
        Expect.correctValue(allOptions[clickedIndex + suggestionsCount].value);
      });
    });
  });

  describe('when maxSuggestions is greater than the number of options', () => {
    const optionsCount = 5;
    it('should display all the options as inline options', () => {
      visitCaseClassification({
        maxSuggestions: optionsCount + 1,
      });

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(optionsCount);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(false);
      });

      scope('when fetching suggestions', () => {
        const suggestionsCount = 2;
        const firstSuggestionIndex = 0;

        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.numberOfInlineOptions(allOptions.length - suggestionsCount);
        Expect.displaySelectInput(false);
        Expect.logClickedSuggestion(firstSuggestionIndex, true);
        Expect.correctValue(allOptions[firstSuggestionIndex].value);
      });
    });
  });

  describe('when required is set to true', () => {
    it('should display an error when no option is selected', () => {
      visitCaseClassification({
        required: true,
      });

      scope('when reporting validity and no option is selected', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
        Actions.reportValidity();
        Expect.displayError(true);
      });

      scope('when reporting validity and an option is selected', () => {
        const clickedIndex = 3;

        Actions.openSelectInput();
        Actions.clickSelectOption(clickedIndex);
        Expect.logUpdatedClassificationFromSelectOption(
          coveoDefaultField,
          clickedIndex
        );
        Actions.reportValidity();
        Expect.displayError(false);
      });
    });

    it('should display an error when no suggestion is selected', () => {
      visitCaseClassification({
        required: true,
      });

      scope('when reporting validity and no suggestion is selected', () => {
        const suggestionsCount = 2;
        const firstSuggestionIndex = 0;

        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(true);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.logClickedSuggestion(firstSuggestionIndex, true);
        Expect.correctValue(allOptions[firstSuggestionIndex].value);
        Actions.clickSuggestion(firstSuggestionIndex);
        Expect.logDeselect(coveoDefaultField);
        Expect.correctValue('');
        Actions.reportValidity();
        Expect.displayError(true);
      });

      scope('when reporting validity and a suggestion is selected', () => {
        const suggestionsCount = 2;
        const firstSuggestionIndex = 0;

        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        Expect.displaySelectTitle(true);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Actions.clickSuggestion(firstSuggestionIndex);
        Expect.correctValue(allOptions[firstSuggestionIndex].value);
        Expect.logClickedSuggestion(firstSuggestionIndex);
        Expect.logUpdatedClassificationFromSuggestion(
          coveoDefaultField,
          firstSuggestionIndex
        );
        Actions.reportValidity();
        Expect.displayError(false);
      });
    });

    it('should hide the error after fetching suggestions and autoselecting the one with the highest confidence', () => {
      visitCaseClassification({
        required: true,
      });

      scope('when reporting validity and no option is selected', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
        Actions.reportValidity();
        Expect.displayError(true);
      });

      scope('when fetching suggestions', () => {
        const suggestionsCount = 2;
        const firstSuggestionIndex = 0;

        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.logClickedSuggestion(firstSuggestionIndex, true);
        Expect.correctValue(allOptions[firstSuggestionIndex].value);
        Expect.displaySelectTitle(true);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.displayError(false);
      });
    });

    it('should keep the error after fetching suggestions but not finding any', () => {
      visitCaseClassification({
        required: true,
      });

      scope('when reporting validity and no suggestion is selected', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
        Actions.reportValidity();
        Expect.displayError(true);
      });

      scope('when fetching suggestions', () => {
        mockCaseClassification(coveoDefaultField, []);
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
        Expect.numberOfSuggestions(0);
        Expect.displayError(true);
      });
    });
  });

  describe('when incorrect Salesforce field API name is given', () => {
    it('should render an error message', () => {
      const incorrectSfField = 'incorrect sfFieldApiName';
      visitCaseClassification({
        sfFieldApiName: incorrectSfField,
      });

      scope('when loading the page', () => {
        Expect.displayLabel(false);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(false);
        Expect.displayComponentError(true);
        Expect.displayComponentErrorMessage(
          incorrectSfFielNameError(incorrectSfField)
        );
      });
    });
  });

  describe('when the Coveo field name is missing', () => {
    it('should render an error message', () => {
      visitCaseClassification({
        coveoFieldName: '',
      });

      scope('when loading the page', () => {
        Expect.displayLabel(false);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(false);
        Expect.displayComponentError(true);
        Expect.displayComponentErrorMessage(missingCoveoFieldNameError);
      });
    });
  });

  describe('when selecting a suggestion and then receiving new suggestions', () => {
    it('should keep the suggestion selected by the user', () => {
      const clickedIndex = 1;
      visitCaseClassification({});

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
      });

      scope('when fetching suggestions', () => {
        const suggestionsCount = 3;
        const firstSuggestionIndex = 0;

        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(true);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.correctSuggestionsOrder(allOptions.slice(0, suggestionsCount));
        Expect.numberOfInlineOptions(0);
        Expect.logClickedSuggestion(firstSuggestionIndex, true);
        Expect.correctValue(allOptions[firstSuggestionIndex].value);
      });

      scope('when selecting a suggestion', () => {
        Actions.clickSuggestion(clickedIndex);
        Expect.logClickedSuggestion(clickedIndex);
        Expect.logUpdatedClassificationFromSuggestion(
          coveoDefaultField,
          clickedIndex
        );
        Expect.correctValue(allOptions[clickedIndex].value);
      });

      scope('when fetching suggestions again', () => {
        const suggestionsCount = 3;

        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(true);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.correctSuggestionsOrder(allOptions.slice(0, suggestionsCount));
        Expect.numberOfInlineOptions(0);
        Expect.correctValue(allOptions[clickedIndex].value);
      });
    });
  });

  describe('when selecting a specific suggestion and then receiving new suggestions that does not contain the previously selected option', () => {
    it('should keep the suggestion selected by the user and display it in the select input', () => {
      const clickedIndex = 2;
      visitCaseClassification({});

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
      });

      scope(
        'when fetching suggestions and getting a first set of suggestions',
        () => {
          const suggestionsCount = 3;
          const firstSuggestionIndex = 0;

          mockCaseClassification(
            coveoDefaultField,
            allOptions.slice(0, suggestionsCount)
          );
          fetchClassifications();
          Expect.displaySelectTitle(true);
          Expect.displaySelectInput(false);
          Expect.numberOfSuggestions(suggestionsCount);
          Expect.correctSuggestionsOrder(allOptions.slice(0, suggestionsCount));
          Expect.numberOfInlineOptions(0);
          Expect.logClickedSuggestion(firstSuggestionIndex, true);
          Expect.correctValue(allOptions[firstSuggestionIndex].value);
        }
      );

      scope('when selecting a suggestion', () => {
        Actions.clickSuggestion(clickedIndex);
        Expect.logClickedSuggestion(clickedIndex);
        Expect.logUpdatedClassificationFromSuggestion(
          coveoDefaultField,
          clickedIndex
        );
        Expect.correctValue(allOptions[clickedIndex].value);
      });

      scope(
        'when fetching suggestions and getting a different set of suggestions',
        () => {
          const suggestionsCount = 1;

          mockCaseClassification(
            coveoDefaultField,
            allOptions.slice(0, suggestionsCount)
          );
          fetchClassifications();
          Expect.displaySelectTitle(false);
          Expect.displaySelectInput(false);
          Expect.numberOfSuggestions(0);
          Expect.numberOfInlineOptions(0);
          Expect.correctValue(allOptions[clickedIndex].value);
        }
      );

      scope(
        'when fetching suggestions and getting again the first set of suggestions',
        () => {
          const suggestionsCount = 3;

          mockCaseClassification(
            coveoDefaultField,
            allOptions.slice(0, suggestionsCount)
          );
          fetchClassifications();
          Expect.displaySelectTitle(true);
          Expect.displaySelectInput(false);
          Expect.numberOfSuggestions(suggestionsCount);
          Expect.correctSuggestionsOrder(allOptions.slice(0, suggestionsCount));
          Expect.numberOfInlineOptions(0);
          Expect.correctValue(allOptions[clickedIndex].value);
        }
      );
    });
  });

  describe('when selecting an option from the select input and then fetching suggestions', () => {
    it('should keep the option selected by the user, display it in the select input and hide the suggestions', () => {
      const clickedIndex = 3;
      visitCaseClassification({});

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
      });

      scope('when selecting an option from the select input', () => {
        Actions.openSelectInput();
        Actions.clickSelectOption(clickedIndex);
        Expect.logUpdatedClassificationFromSelectOption(
          coveoDefaultField,
          clickedIndex
        );
        Expect.correctValue(allOptions[clickedIndex].value);
      });

      scope('when fetching suggestions', () => {
        const suggestionsCount = 3;

        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displayLoading(false);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
        Expect.numberOfSuggestions(0);
        Expect.numberOfInlineOptions(0);
        Expect.correctValue(allOptions[clickedIndex].value);
      });
    });
  });

  describe('when receiving new suggestions without changing the by default auto-selected suggestion', () => {
    it('should auto-select the suggestion with the highest confidence from the newly received suggestions', () => {
      visitCaseClassification({});

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
      });

      scope('when fetching suggestions', () => {
        const suggestionsCount = 3;
        const firstSuggestionIndex = 0;

        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(true);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.correctSuggestionsOrder(allOptions.slice(0, suggestionsCount));
        Expect.numberOfInlineOptions(0);
        Expect.logClickedSuggestion(firstSuggestionIndex, true);
        Expect.correctValue(allOptions[firstSuggestionIndex].value);
      });

      scope('when fetching suggestions again', () => {
        const suggestionsCount = 2;
        const firstDisplayedSuggestionIndex = 0;
        const firstSuggestionIndex = 1;

        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(
            firstSuggestionIndex,
            firstSuggestionIndex + suggestionsCount
          )
        );
        fetchClassifications();
        Expect.displaySelectTitle(true);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.correctSuggestionsOrder(
          allOptions.slice(
            firstSuggestionIndex,
            firstSuggestionIndex + suggestionsCount
          )
        );
        Expect.numberOfInlineOptions(0);
        Expect.logClickedSuggestion(firstDisplayedSuggestionIndex, true);
        Expect.correctValue(allOptions[firstSuggestionIndex].value);
      });
    });
  });

  describe('when selecting an inline option and then fetching suggestions', () => {
    it('should keep the option selected by the user, display it in an inline option and display the suggestions', () => {
      const suggestionsCount = 3;
      const clickedIndex = 4;
      visitCaseClassification({
        maxSuggestions: allOptions.length,
      });

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(allOptions.length);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(false);
      });

      scope('when selecting an inline option', () => {
        Actions.clickInlineOption(clickedIndex);
        Expect.logUpdatedClassificationFromInlineOption(
          coveoDefaultField,
          clickedIndex
        );
        Expect.correctValue(allOptions[clickedIndex].value);
      });

      scope('when fetching suggestions', () => {
        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.correctSuggestionsOrder(allOptions.slice(0, suggestionsCount));
        Expect.numberOfInlineOptions(allOptions.length - suggestionsCount);
        Expect.correctValue(allOptions[clickedIndex].value);
      });
    });
  });

  describe('when the suggestions are not included in all the options retrieved from Salesforce', () => {
    it('should display only the select dropdown and log warnings in the console', () => {
      interceptCaseAssist();
      mockSfPicklistValues(sfDefaultField, allOptions);

      cy.visit(pageUrl, {
        onBeforeLoad(win) {
          stubConsoleWarning(win);
        },
      });
      configure({
        coveoFieldName: nonCorrespondingCoveoField,
      });

      scope('when loading the page', () => {
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
      });

      scope('when fetching suggestions', () => {
        mockCaseClassification(
          nonCorrespondingCoveoField,
          nonCorrespondingSuggestions
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
        Expect.numberOfSuggestions(0);
        Expect.numberOfInlineOptions(0);
        nonCorrespondingSuggestions.forEach((suggestion: {value: string}) => {
          Expect.console.warning(
            true,
            nonCorrespondingSuggestionWarning(
              suggestion.value,
              nonCorrespondingCoveoField,
              sfDefaultField
            )
          );
        });
      });
    });
  });

  describe('when the fetchClassificationsOnChange property is set to true', async () => {
    describe('when a suggestion is selected', () => {
      it('should automatically fetch new case classifications', () => {
        const clickedIndex = 1;
        const suggestionsCount = 3;
        visitCaseClassification({
          fetchClassificationOnChange: true,
        });

        scope('when loading the page', () => {
          Expect.displayLabel(true);
          Expect.numberOfInlineOptions(0);
          Expect.numberOfSuggestions(0);
          Expect.displaySelectTitle(false);
          Expect.displaySelectInput(true);
        });
        scope('when fetching suggestions', () => {
          const firstSuggestionIndex = 0;

          mockCaseClassification(
            coveoDefaultField,
            allOptions.slice(0, suggestionsCount)
          );
          fetchClassifications();
          Expect.displaySelectTitle(true);
          Expect.displaySelectInput(false);
          Expect.numberOfSuggestions(suggestionsCount);
          Expect.correctSuggestionsOrder(allOptions.slice(0, suggestionsCount));
          Expect.numberOfInlineOptions(0);
          Expect.logClickedSuggestion(firstSuggestionIndex, true);
          Expect.correctValue(allOptions[firstSuggestionIndex].value);
        });

        scope('when selecting a suggestion', () => {
          Actions.clickSuggestion(clickedIndex);
          Expect.logClickedSuggestion(clickedIndex);
          Expect.logUpdatedClassificationFromSuggestion(
            coveoDefaultField,
            clickedIndex
          );
          Expect.correctValue(allOptions[clickedIndex].value);
          Expect.fetchClassifications();
        });
      });
    });

    describe('when an inline option is selected', () => {
      it('should automatically fetch new case classifications', () => {
        const suggestionsCount = 2;
        const optionsCount = 5;
        visitCaseClassification({
          fetchClassificationOnChange: true,
          maxSuggestions: optionsCount,
        });

        scope('when loading the page', () => {
          Expect.displayLabel(true);
          Expect.numberOfInlineOptions(optionsCount);
          Expect.numberOfSuggestions(0);
          Expect.displaySelectTitle(false);
          Expect.displaySelectInput(false);
        });

        scope('when fetching suggestions', () => {
          const firstSuggestionIndex = 0;

          mockCaseClassification(
            coveoDefaultField,
            allOptions.slice(0, suggestionsCount)
          );
          fetchClassifications();
          Expect.displaySelectTitle(false);
          Expect.numberOfSuggestions(suggestionsCount);
          Expect.numberOfInlineOptions(allOptions.length - suggestionsCount);
          Expect.displaySelectInput(false);
          Expect.logClickedSuggestion(firstSuggestionIndex, true);
          Expect.correctValue(allOptions[firstSuggestionIndex].value);
        });

        scope('when selecting an inline option', () => {
          const clickedIndex = 0;

          Actions.clickInlineOption(clickedIndex);
          Expect.logUpdatedClassificationFromInlineOption(
            coveoDefaultField,
            clickedIndex
          );
          Expect.correctValue(
            allOptions[clickedIndex + suggestionsCount].value
          );
          Expect.fetchClassifications();
        });
      });
    });

    describe('when an option from the select input is selected', () => {
      it('should automatically fetch new case classifications', () => {
        const suggestionsCount = 3;
        visitCaseClassification({
          fetchClassificationOnChange: true,
        });

        scope('when loading the page', () => {
          Expect.displayLabel(true);
          Expect.numberOfInlineOptions(0);
          Expect.numberOfSuggestions(0);
          Expect.displaySelectTitle(false);
          Expect.displaySelectInput(true);
        });

        scope('when fetching suggestions', () => {
          const firstSuggestionIndex = 0;

          mockCaseClassification(
            coveoDefaultField,
            allOptions.slice(0, suggestionsCount)
          );
          fetchClassifications();
          Expect.displaySelectTitle(true);
          Expect.displaySelectInput(false);
          Expect.numberOfSuggestions(suggestionsCount);
          Expect.correctSuggestionsOrder(allOptions.slice(0, suggestionsCount));
          Expect.numberOfInlineOptions(0);
          Expect.logClickedSuggestion(firstSuggestionIndex, true);
          Expect.correctValue(allOptions[firstSuggestionIndex].value);
        });

        scope('when selecting an option from the select input', () => {
          const clickedIndex = 3;
          Actions.clickSelectTitle();
          Actions.openSelectInput();
          Actions.clickSelectOption(clickedIndex);
          Expect.correctValue(allOptions[clickedIndex].value);
          Expect.logUpdatedClassificationFromSelectOption(
            coveoDefaultField,
            clickedIndex
          );
          Expect.fetchClassifications();
        });
      });
    });
  });

  describe('when the fetchDocumentSuggestionOnChange property is set to true', async () => {
    describe('when a suggestion is selected', () => {
      it('should automatically fetch new document suggestions', () => {
        const clickedIndex = 1;
        const suggestionsCount = 3;
        visitCaseClassification({
          fetchDocumentSuggestionOnChange: true,
        });
        scope('when loading the page', () => {
          Expect.displayLabel(true);
          Expect.numberOfInlineOptions(0);
          Expect.numberOfSuggestions(0);
          Expect.displaySelectTitle(false);
          Expect.displaySelectInput(true);
        });

        scope('when fetching suggestions', () => {
          const firstSuggestionIndex = 0;

          interceptDocumentSuggestion();
          mockCaseClassification(
            coveoDefaultField,
            allOptions.slice(0, suggestionsCount)
          );
          fetchClassifications();

          Expect.displaySelectTitle(true);
          Expect.displaySelectInput(false);
          Expect.numberOfSuggestions(suggestionsCount);
          Expect.correctSuggestionsOrder(allOptions.slice(0, suggestionsCount));
          Expect.numberOfInlineOptions(0);
          Expect.logClickedSuggestion(firstSuggestionIndex, true);
          Expect.correctValue(allOptions[firstSuggestionIndex].value);
        });

        scope('when selecting a suggestion', () => {
          Actions.clickSuggestion(clickedIndex);
          Expect.correctValue(allOptions[clickedIndex].value);
          Expect.logClickedSuggestion(clickedIndex);
          Expect.logUpdatedClassificationFromSuggestion(
            coveoDefaultField,
            clickedIndex
          );
          Expect.fetchDocumentSuggestions();
        });
      });
    });

    describe('when an inline option is selected', () => {
      it('should automatically fetch new document suggestions', () => {
        const suggestionsCount = 2;
        const optionsCount = 5;
        visitCaseClassification({
          fetchDocumentSuggestionOnChange: true,
          maxSuggestions: optionsCount,
        });

        scope('when loading the page', () => {
          Expect.displayLabel(true);
          Expect.numberOfInlineOptions(optionsCount);
          Expect.numberOfSuggestions(0);
          Expect.displaySelectTitle(false);
          Expect.displaySelectInput(false);
        });

        scope('when fetching suggestions', () => {
          const firstSuggestionIndex = 0;

          interceptDocumentSuggestion();
          mockCaseClassification(
            coveoDefaultField,
            allOptions.slice(0, suggestionsCount)
          );
          fetchClassifications();

          Expect.displaySelectTitle(false);
          Expect.numberOfSuggestions(suggestionsCount);
          Expect.numberOfInlineOptions(allOptions.length - suggestionsCount);
          Expect.displaySelectInput(false);
          Expect.logClickedSuggestion(firstSuggestionIndex, true);
          Expect.correctValue(allOptions[firstSuggestionIndex].value);
        });

        scope('when selecting an inline option', () => {
          const clickedIndex = 0;

          Actions.clickInlineOption(clickedIndex);
          Expect.logUpdatedClassificationFromInlineOption(
            coveoDefaultField,
            clickedIndex
          );
          Expect.correctValue(
            allOptions[clickedIndex + suggestionsCount].value
          );
          Expect.fetchDocumentSuggestions();
        });
      });
    });

    describe('when an option from the select input is selected', () => {
      it('should automatically fetch new document suggestions', () => {
        const suggestionsCount = 3;
        visitCaseClassification({
          fetchDocumentSuggestionOnChange: true,
        });
        scope('when loading the page', () => {
          Expect.displayLabel(true);
          Expect.numberOfInlineOptions(0);
          Expect.numberOfSuggestions(0);
          Expect.displaySelectTitle(false);
          Expect.displaySelectInput(true);
        });

        scope('when fetching suggestions', () => {
          const firstSuggestionIndex = 0;

          interceptDocumentSuggestion();
          mockCaseClassification(
            coveoDefaultField,
            allOptions.slice(0, suggestionsCount)
          );
          fetchClassifications();

          Expect.displaySelectTitle(true);
          Expect.displaySelectInput(false);
          Expect.numberOfSuggestions(suggestionsCount);
          Expect.correctSuggestionsOrder(allOptions.slice(0, suggestionsCount));
          Expect.numberOfInlineOptions(0);
          Expect.logClickedSuggestion(firstSuggestionIndex, true);
          Expect.correctValue(allOptions[firstSuggestionIndex].value);
        });

        scope('when selecting an option from the select input', () => {
          const clickedIndex = 3;

          Actions.clickSelectTitle();
          Actions.openSelectInput();
          Actions.clickSelectOption(clickedIndex);
          Expect.correctValue(allOptions[clickedIndex].value);
          Expect.logUpdatedClassificationFromSelectOption(
            coveoDefaultField,
            clickedIndex
          );
          Expect.fetchDocumentSuggestions();
        });
      });
    });
  });

  describe('when the fetchOnInit property is set to true', () => {
    it('should automatically fetch classifications during initialization', () => {
      const suggestionsCount = 3;
      const firstSuggestionIndex = 0;
      mockCaseClassification(
        coveoDefaultField,
        allOptions.slice(0, suggestionsCount)
      );
      visitCaseClassification({
        fetchOnInit: true,
      });

      scope('when loading the page', () => {
        Expect.fetchClassifications();
        Expect.displaySelectTitle(true);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.correctSuggestionsOrder(allOptions.slice(0, suggestionsCount));
        Expect.numberOfInlineOptions(0);
        Expect.logClickedSuggestion(firstSuggestionIndex, true);
        Expect.correctValue(allOptions[firstSuggestionIndex].value);
      });
    });
  });
});
