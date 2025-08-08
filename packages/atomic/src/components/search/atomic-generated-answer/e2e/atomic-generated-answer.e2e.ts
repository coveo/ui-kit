import {expect, test} from './fixture';

test.describe('atomic-generated-answer citation', () => {
  test.describe('with citation anchoring enabled', () => {
    test.beforeEach(async ({generatedAnswer, searchBox}) => {
      await generatedAnswer.load({story: 'in-page'});
      await generatedAnswer.performSearch(searchBox);
      await generatedAnswer.waitForCitations();
    });

    test('should render citation when available', async ({generatedAnswer}) => {
      const citationCount = await generatedAnswer.getCitationCount();
      expect(citationCount).toBeGreaterThan(0);
      await generatedAnswer.citation.first().screenshot();
    });

    test('should only append text fragment to HTML citations', async ({
      generatedAnswer,
    }) => {
      const citationCount = await generatedAnswer.getCitationCount();

      for (let i = 0; i < citationCount; i++) {
        const filetype = await generatedAnswer.getCitationFiletype(i);
        const href = await generatedAnswer.getCitationHref(i);

        if (filetype === 'html') {
          expect(href).toMatch(/#:~:text=/);
        } else {
          expect(href).not.toMatch(/#:~:text=/);
        }
      }
    });
  });

  test.describe('with citation anchoring disabled', () => {
    test.beforeEach(async ({generatedAnswer}) => {
      await generatedAnswer.load({story: 'disable-citation-anchoring'});
    });

    test('should not have text fragment when citation anchoring is disabled', async ({
      generatedAnswer,
      searchBox,
    }) => {
      await generatedAnswer.performSearch(searchBox);
      await generatedAnswer.waitForCitations();
      const href = await generatedAnswer.getCitationHref(0);

      expect(href).toBeTruthy();
      expect(href).not.toContain('#:~:text=');
    });
  });
});
