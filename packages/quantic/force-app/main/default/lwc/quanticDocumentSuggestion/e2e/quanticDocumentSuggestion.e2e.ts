/* eslint-disable no-await-in-loop */
import {test, expect} from './fixture';

['legacy', 'next'].forEach((mode) => {
  test.describe(`quantic document suggestion ${mode} analytics`, () => {
    let analyticsMode = 'legacy';
    test.beforeEach(async ({documentSuggestion, page}) => {
      analyticsMode = mode;
      if (analyticsMode === 'next') {
        await page.context().addCookies([
          {
            name: 'Coveo-Pendragon',
            value: 'tracking_id_123',
            domain: '.my.site.com',
            path: '/',
          },
          {
            name: 'LSKey-c$Coveo-Pendragon',
            value: 'tracking_id_123',
            domain: '.my.site.com',
            path: '/',
          },
        ]);
      }

      await expect(documentSuggestion.noSuggestionsMessage).toBeVisible();
    });

    test('should render the component and all parts', async ({
      documentSuggestion,
      caseAssist,
    }) => {
      await expect(documentSuggestion.accordion).not.toBeVisible();
      await expect(documentSuggestion.noSuggestionsMessage).toBeVisible();

      const responsePromise = caseAssist.waitForDocumentSuggestionResponse();
      await caseAssist.fetchSuggestions();
      const response = await responsePromise;
      const responseBody = await response.json();

      await expect(documentSuggestion.accordion).toBeVisible();
      await expect(documentSuggestion.noSuggestionsMessage).not.toBeVisible();
      await expect(documentSuggestion.sections).toHaveCount(3);

      for (const [index, section] of (
        await documentSuggestion.sections.all()
      ).entries()) {
        await expect(section).toBeVisible();
        await expect(section).toHaveText(
          new RegExp(responseBody.documents[index].title)
        );
      }
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

      const analyticsPromise =
        analyticsMode === 'legacy'
          ? documentSuggestion.waitForSuggestionCollectEvent()
          : documentSuggestion.waitForSuggestionClickEvent();

      await documentSuggestion.clickSuggestion(1);
      const analyticsRequest = await analyticsPromise;

      if (analyticsMode === 'legacy') {
        const event = analyticsRequest.postDataJSON?.();
        expect(event?.svc_action_data.suggestion.documentPosition).toBe(2);
        expect(event?.svc_action_data.suggestion.documentTitle).toBe(
          suggestions.documents[1].title
        );
      } else {
        const beaconData = (await page.evaluate(() => window.__beaconData)).map(
          (data) => JSON.parse(data.text)[0]
        );

        const clickEvent = beaconData.find(
          (bacon) => bacon.meta.type === 'caseAssist.documentSuggestionClick'
        );
        expect(clickEvent).toBeDefined();
        expect(clickEvent.meta.config.trackingId).toBe('tracking_id_123');
        expect(clickEvent.documentSuggestion.responseId).toBeDefined();
        expect(clickEvent.documentSuggestion.id).toBe(
          suggestions.documents[1].uniqueId
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
