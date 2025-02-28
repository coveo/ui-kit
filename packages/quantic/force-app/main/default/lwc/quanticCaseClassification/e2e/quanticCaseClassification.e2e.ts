import {test, expect} from './fixture';
import {
  caseClassificationSuggestions,
  coveoDefaultField,
  allOptions,
} from './data';

test.describe('quantic case classification', () => {
  test.describe('the analytics', () => {
    test.describe('when new case classifications suggestions are received', () => {
      test('should log the proper ticket classification click collect event for the automatically selected suggestion', async ({
        caseClassification,
        caseAssist,
      }) => {
        const indexOfNewSuggestion = 1;
        const {
          id: selectedSuggestionId,
          value: selectedSuggestionValue,
          confidence: selectedSuggestionConfidence,
        } = caseClassificationSuggestions[indexOfNewSuggestion];
        caseClassification.mockCaseClassification(coveoDefaultField, [
          caseClassificationSuggestions[indexOfNewSuggestion],
        ]);

        const automaticallySelectedSuggestionCollectEventPromise =
          caseClassification.waitForTicketClassificationClickCollectAnalytics({
            classificationId: selectedSuggestionId,
            responseId: '123',
            fieldName: coveoDefaultField,
            classification: {
              value: selectedSuggestionValue,
              confidence: selectedSuggestionConfidence,
            },
            autoSelection: true,
          });

        await caseAssist.fetchClassifications();
        await automaticallySelectedSuggestionCollectEventPromise;
      });
    });

    test.describe('clicking on a case classification suggestion', () => {
      test('should log the proper collect events', async ({
        caseClassification,
      }) => {
        const selectedSuggestionIndex = 1;
        const {
          id: selectedSuggestionId,
          value: selectedSuggestionValue,
          confidence: selectedSuggestionConfidence,
        } = caseClassificationSuggestions[selectedSuggestionIndex];
        const selectedSuggestionCollectEventPromise =
          caseClassification.waitForTicketClassificationClickCollectAnalytics({
            classificationId: selectedSuggestionId,
            responseId: '123',
            fieldName: coveoDefaultField,
            classification: {
              value: selectedSuggestionValue,
              confidence: selectedSuggestionConfidence,
            },
          });
        const fieldUpdateCollectEventPromise =
          caseClassification.waitForTicketFieldUpdateCollectAnalytics({
            fieldName: coveoDefaultField,
          });
        await caseClassification.clickCaseClassificationSuggestionAtIndex(
          selectedSuggestionIndex
        );
        await selectedSuggestionCollectEventPromise;
        await fieldUpdateCollectEventPromise;
      });
    });

    test.describe('clicking on a case classification option', () => {
      test('should log the proper collect events', async ({
        caseClassification,
      }) => {
        const fieldUpdateCollectEventPromise =
          caseClassification.waitForTicketFieldUpdateCollectAnalytics({
            fieldName: coveoDefaultField,
          });

        await caseClassification.clickShowSelectInputButton();
        await caseClassification.clickallOptionsSelectInput();
        await caseClassification.clickSelectInputOptionAtIndex(3);
        await fieldUpdateCollectEventPromise;
      });
    });
  });

  test.describe('when the property fetchClassificationOnChange is set to true', () => {
    test.use({
      options: {fetchClassificationOnChange: true},
    });

    test('should trigger a new classification request when a case classification suggestion is clicked', async ({
      caseClassification,
      caseAssist,
    }) => {
      const caseClassificationsResponsePromise =
        caseAssist.waitForCaseClassificationsResponse();

      await caseClassification.clickCaseClassificationSuggestionAtIndex(1);

      await caseClassificationsResponsePromise;
    });

    test('should trigger a new classification request when a case classification option is clicked', async ({
      caseClassification,
      caseAssist,
    }) => {
      const caseClassificationsResponsePromise =
        caseAssist.waitForCaseClassificationsResponse();

      await caseClassification.clickShowSelectInputButton();
      await caseClassification.clickallOptionsSelectInput();
      await caseClassification.clickSelectInputOptionAtIndex(3);

      await caseClassificationsResponsePromise;
    });
  });

  test.describe('when the property fetchDocumentSuggestionOnChange is set to true', () => {
    test.use({
      options: {fetchDocumentSuggestionOnChange: true},
    });

    test('should trigger a new document suggestions request when a case classification suggestion is clicked', async ({
      caseClassification,
      caseAssist,
    }) => {
      const documentSuggestionResponsePromise =
        caseAssist.waitForDocumentSuggestionResponse();

      await caseClassification.clickCaseClassificationSuggestionAtIndex(1);

      await documentSuggestionResponsePromise;
    });

    test('should trigger a new document suggestions request when a case classification option is clicked', async ({
      caseClassification,
      caseAssist,
    }) => {
      const documentSuggestionResponsePromise =
        caseAssist.waitForDocumentSuggestionResponse();

      await caseClassification.clickShowSelectInputButton();
      await caseClassification.clickallOptionsSelectInput();
      await caseClassification.clickSelectInputOptionAtIndex(3);

      await documentSuggestionResponsePromise;
    });
  });

  test.describe('the behaviour of the case classifications', () => {
    test.describe('when selecting a suggestion and then receiving new suggestions that include the selected suggestion', () => {
      test('should keep the suggestion by the user selected and display it as an inline option', async ({
        caseClassification,
        caseAssist,
      }) => {
        const selectedSuggestionIndex = 1;
        await caseClassification.clickCaseClassificationSuggestionAtIndex(
          selectedSuggestionIndex
        );
        await expect(caseClassification.selectedSuggestion).toHaveValue(
          caseClassificationSuggestions[selectedSuggestionIndex].value
        );

        caseClassification.mockCaseClassification(
          coveoDefaultField,
          caseClassificationSuggestions
        );
        const caseClassificationsResponsePromise =
          caseAssist.waitForCaseClassificationsResponse();
        await caseAssist.fetchClassifications();
        await caseClassificationsResponsePromise;
        await expect(caseClassification.selectedSuggestion).toHaveValue(
          caseClassificationSuggestions[selectedSuggestionIndex].value
        );
      });
    });

    test.describe('when selecting a specific suggestion and then receiving new suggestions that does not contain the previously selected option', () => {
      test('should keep the suggestion selected by the user and display it in the select input', async ({
        caseClassification,
        caseAssist,
      }) => {
        const selectedSuggestionIndex = 1;
        await caseClassification.clickCaseClassificationSuggestionAtIndex(
          selectedSuggestionIndex
        );
        await expect(caseClassification.selectedSuggestion).toHaveValue(
          caseClassificationSuggestions[selectedSuggestionIndex].value
        );

        caseClassification.mockCaseClassification(coveoDefaultField, [
          caseClassificationSuggestions[0],
        ]);
        const caseClassificationsResponsePromise =
          caseAssist.waitForCaseClassificationsResponse();
        await caseAssist.fetchClassifications();
        await caseClassificationsResponsePromise;

        await expect(caseClassification.allOptionsSelectInput).toHaveText(
          caseClassificationSuggestions[selectedSuggestionIndex].value
        );
      });
    });

    test.describe('when selecting an option from the select input and then fetching suggestions', () => {
      test('should keep the option selected by the user, display it in the select input and hide the suggestions', async ({
        caseClassification,
        caseAssist,
      }) => {
        const selectedOptionIndex = 3;
        await caseClassification.clickShowSelectInputButton();
        await caseClassification.clickallOptionsSelectInput();
        await caseClassification.clickSelectInputOptionAtIndex(
          selectedOptionIndex
        );

        caseClassification.mockCaseClassification(coveoDefaultField, [
          caseClassificationSuggestions[0],
        ]);
        const caseClassificationsResponsePromise =
          caseAssist.waitForCaseClassificationsResponse();
        await caseAssist.fetchClassifications();
        await caseClassificationsResponsePromise;
        await expect(await caseClassification.allOptionsSelectInputValue).toBe(
          allOptions[selectedOptionIndex].value
        );
        await expect(
          caseClassification.caseClassificationSuggestions
        ).toHaveCount(0);
      });
    });

    test.describe('when receiving new suggestions without changing the by default auto-selected suggestion', () => {
      test('should auto-select the suggestion with the highest confidence from the newly received suggestions', async ({
        caseClassification,
        caseAssist,
      }) => {
        const firstAutomaticallySelectedSuggestionIndex = 0;
        await expect(caseClassification.selectedSuggestion).toHaveValue(
          caseClassificationSuggestions[
            firstAutomaticallySelectedSuggestionIndex
          ].value
        );

        const secondAutomaticallySelectedSuggestionIndex = 1;

        caseClassification.mockCaseClassification(coveoDefaultField, [
          caseClassificationSuggestions[
            secondAutomaticallySelectedSuggestionIndex
          ],
        ]);
        const caseClassificationsResponsePromise =
          caseAssist.waitForCaseClassificationsResponse();
        await caseAssist.fetchClassifications();
        await caseClassificationsResponsePromise;
        await expect(caseClassification.selectedSuggestion).toHaveValue(
          caseClassificationSuggestions[
            secondAutomaticallySelectedSuggestionIndex
          ].value
        );
      });
    });
  });
});
