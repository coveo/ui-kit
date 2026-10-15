/* eslint-disable no-await-in-loop */
import {test, expect} from './fixture';
import {
  AnalyticsModeEnum,
  analyticsModeTest,
} from '../../../../../../playwright/utils/analyticsMode';
import {exampleTrackingId} from '../../../../../../playwright/page-object/analytics';

analyticsModeTest.forEach((analytics) => {
  test.describe(`quantic document suggestion ${analytics.label}`, () => {
    test.use({
      analyticsMode: analytics.mode,
    });

    test('should handle clicking on a document suggestion', async ({
      documentSuggestion,
      caseAssist,
    }) => {
      const responsePromise = caseAssist.waitForDocumentSuggestionResponse();
      await caseAssist.fetchSuggestions();
      const response = await responsePromise;
      const suggestions = await response.json();
      const clickedPosition = 2;

      const analyticsPromise = documentSuggestion.waitForSuggestionClickEvent();
      await documentSuggestion.clickSuggestion(clickedPosition);
      const analyticsRequest = await analyticsPromise;
      const payload = analyticsRequest.postDataJSON?.();

      if (analytics.mode === AnalyticsModeEnum.legacy) {
        expect(payload).toBeDefined();
        const event = JSON.parse(payload.clickEvent);
        expect(event.actionCause).toBe('documentSuggestionClick');
        expect(event.documentPosition).toBe(clickedPosition + 1);
        expect(event.documentTitle).toBe(
          suggestions.documents[clickedPosition].title
        );
        expect(event.documentUrl).toBe(
          suggestions.documents[clickedPosition].clickUri
        );
      } else {
        expect(payload).toBeDefined();
        expect(payload.length).toBe(1);
        expect(payload[0].meta.config.trackingId).toBe(exampleTrackingId);
        expect(payload[0].meta.type).toBe('CaseAssist.DocumentSuggestionClick');
        expect(payload[0].responseId).toBeDefined();
        expect(payload[0].position).toBe(clickedPosition + 1);
        expect(payload[0].itemMetadata.title).toBe(
          suggestions.documents[clickedPosition].title
        );
        expect(payload[0].itemMetadata.uniqueFieldName).toBe('uniqueId');
        expect(payload[0].itemMetadata.uniqueFieldValue).toBe(
          suggestions.documents[clickedPosition].uniqueId
        );
      }
    });

    test.describe('when numberOfAutoOpenedDocuments is set to the same as maxDocument', () => {
      const maxDocuments = 6;
      test.use({
        options: {
          maxDocuments,
          numberOfAutoOpenedDocuments: maxDocuments,
        },
      });

      test('should open all documents', async ({
        documentSuggestion,
        caseAssist,
      }) => {
        const responsePromise = caseAssist.waitForDocumentSuggestionResponse();
        await caseAssist.fetchSuggestions();
        const {documents} = await (await responsePromise).json();
        const expectedSections = Math.min(documents.length, maxDocuments);

        await expect(documentSuggestion.accordion).toBeVisible();
        await expect(documentSuggestion.sections).toHaveCount(
          expectedSections
        );
        for (let index = 0; index < expectedSections; index++) {
          await expect(documentSuggestion.sectionContent(index)).toBeVisible();
        }
      });
    });
  });
});
