/* eslint-disable no-await-in-loop */
import {test, expect} from './fixture';

const fakeTrackingId = 'tracking_id_123';

['legacy', 'next'].forEach((mode) => {
  test.describe(`quantic document suggestion with analytics mode: ${mode}`, () => {
    let analyticsMode = 'legacy';
    test.beforeEach(async ({documentSuggestion, page}) => {
      analyticsMode = mode;
      if (analyticsMode === 'next') {
        await page.context().addCookies([
          {
            name: 'Coveo-Pendragon',
            value: fakeTrackingId,
            domain: '.my.site.com',
            path: '/',
          },
          {
            name: 'LSKey-c$Coveo-Pendragon',
            value: fakeTrackingId,
            domain: '.my.site.com',
            path: '/',
          },
        ]);
      }

      await expect(documentSuggestion.noSuggestionsMessage).toBeVisible();
    });

    test('should handle clicking on a document suggestion', async ({
      page,
      documentSuggestion,
      caseAssist,
    }) => {
      const responsePromise = caseAssist.waitForDocumentSuggestionResponse();
      await caseAssist.fetchSuggestions();
      const response = await responsePromise;
      const suggestions = await response.json();
      const clickedPosition = 2;

      // Hack(?) to have the request payload in the analytics request next.
      await page.route('*analytics*', (route) => {
        route.continue();
      });

      const analyticsPromise =
        documentSuggestion.waitForSuggestionClickEvent(analyticsMode);
      await documentSuggestion.clickSuggestion(clickedPosition);
      const analyticsRequest = await analyticsPromise;
      const payload = analyticsRequest.postDataJSON?.();

      if (analyticsMode === 'legacy') {
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
        expect(payload[0].meta.config.trackingId).toBe(fakeTrackingId);
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
      test.use({
        options: {
          maxDocuments: 6,
          numberOfAutoOpenedDocuments: 6,
        },
      });

      test('should open all documents', async ({
        documentSuggestion,
        caseAssist,
      }) => {
        await caseAssist.fetchSuggestions();
        await expect(documentSuggestion.accordion).toBeVisible();
        const sections = await documentSuggestion.sections.count();
        for (let index = 0; index < sections; index++) {
          await expect(documentSuggestion.sectionContent(index)).toBeVisible();
        }
      });
    });
  });
});
