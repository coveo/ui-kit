import {expect, test} from './fixture';

test.describe('atomic-generated-answer', () => {
  test.describe('citations', () => {
    test.beforeEach(async ({generatedAnswer}) => {
      await generatedAnswer.load({story: 'default'});
      await generatedAnswer.waitForCitations();
    });

    test('should show popover when hovering over citation', async ({
      generatedAnswer,
    }) => {
      await test.step('Verify first citation popover', async () => {
        await generatedAnswer.citation.first().hover();

        const popover = await generatedAnswer.getCitationPopover(0);
        await popover.waitFor({state: 'visible', timeout: 1000});

        const text = await popover.textContent();
        expect(text).toContain(
          'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Connection With Tivo on XB Family Smart TVs'
        );
        expect(text).toContain(
          'How To Resolve Netflix Connection With Tivo on XB Family Smart TVs'
        );
        expect(text).toContain(
          'Tivo can cause some problems with the Netflix App on your XBR6 Smart TV'
        );
      });

      await test.step('Verify second citation popover', async () => {
        await generatedAnswer.citation.nth(1).hover();

        const popover = await generatedAnswer.getCitationPopover(1);
        await popover.waitFor({state: 'visible', timeout: 1000});

        const text = await popover.textContent();
        expect(text).toContain(
          'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Playback Errors on Besttech XB Smart TVs'
        );
        expect(text).toContain(
          'How To Resolve Netflix Playback Errors on Besttech XB Smart TVs'
        );
        expect(text).toContain(
          'the problem by eliminating the router or wireless connectivity problems as a possible cause'
        );
      });
    });

    test.describe('citation anchoring', () => {
      test.describe('with citation anchoring enabled', () => {
        test('should render citation when available', async ({
          generatedAnswer,
        }) => {
          const citationCount = await generatedAnswer.getCitationCount();
          expect(citationCount).toBeGreaterThan(0);
          await generatedAnswer.citation.first().screenshot();
        });

        test('should navigate to citation URL with text fragment on click', async ({
          generatedAnswer,
        }) => {
          const citationCount = await generatedAnswer.getCitationCount();

          for (let i = 0; i < citationCount; i++) {
            const filetype = await generatedAnswer.getCitationFiletype(i);

            // Listen for popup event (citations open in new tab with target="_blank")
            const popupPromise = generatedAnswer.page.waitForEvent('popup');

            await generatedAnswer.citation.nth(i).click();

            const popup = await popupPromise;
            const popupUrl = popup.url();

            expect(popupUrl).toBeTruthy();

            if (filetype === 'html') {
              expect(popupUrl).toMatch(/#:~:text=/);
            } else {
              expect(popupUrl).not.toMatch(/#:~:text=/);
            }

            await popup.close();
          }
        });
      });

      test.describe('with citation anchoring disabled', () => {
        test.beforeEach(async ({generatedAnswer}) => {
          await generatedAnswer.load({story: 'disable-citation-anchoring'});
        });

        test('should not have text fragment when citation anchoring is disabled', async ({
          generatedAnswer,
        }) => {
          await generatedAnswer.waitForCitations();

          // Listen for popup event (citations open in new tab with target="_blank")
          const popupPromise = generatedAnswer.page.waitForEvent('popup');

          await generatedAnswer.citation.first().click();

          const popup = await popupPromise;
          const popupUrl = popup.url();

          expect(popupUrl).toBeTruthy();
          expect(popupUrl).not.toContain('#:~:text=');

          await popup.close();
        });
      });
    });
  });

  test.describe('answer rendering', () => {
    test('should render answer with bullet points', async ({
      generatedAnswer,
    }) => {
      await generatedAnswer.load({story: 'answer-with-bullet-points'});

      await generatedAnswer.waitForListItems();
      const listItems = await generatedAnswer.getListItemTexts();

      const expectedList = [
        'Eastern White Pine (Pinus strobus)',
        'Red Pine (Pinus resinosa)',
        'Sugar Pine (Pinus lambertiana)',
        'Scots Pine (Pinus sylvestris)',
      ];

      for (const expectedItem of expectedList) {
        const foundItem = listItems.find((item) => item.includes(expectedItem));
        expect(foundItem).toBeTruthy();
      }
    });

    test('should render answer with code blocks', async ({generatedAnswer}) => {
      await generatedAnswer.load({story: 'answer-with-code'});

      await generatedAnswer.waitForCodeBlocks();
      const codeBlockCount = await generatedAnswer.getCodeBlockCount();
      expect(codeBlockCount).toBeGreaterThan(0);

      const codeTexts = await generatedAnswer.getCodeBlockTexts();
      const combinedCode = codeTexts.join(' ');
      expect(combinedCode).toContain('await window.loadAtomic()');
      expect(combinedCode).toContain('atomic-commerce-interface');
    });

    test('should render answer with table', async ({generatedAnswer}) => {
      await generatedAnswer.load({story: 'answer-with-table'});

      await generatedAnswer.waitForTables();
      const tableCount = await generatedAnswer.getTableCount();
      expect(tableCount).toBeGreaterThan(0);

      const tableTexts = await generatedAnswer.getTableTexts();
      const combinedTable = tableTexts.join(' ');
      expect(combinedTable).toContain('Query Syntax');
      expect(combinedTable).toContain('term1 AND term2');
    });

    test('should render comprehensive answer with all markdown features', async ({
      generatedAnswer,
    }) => {
      await generatedAnswer.load({story: 'comprehensive-answer'});

      // Bullet points
      await generatedAnswer.waitForListItems();
      const listItemCount = await generatedAnswer.getListItemCount();
      expect(listItemCount).toBeGreaterThan(0);

      const listItems = await generatedAnswer.getListItemTexts();
      const combinedText = listItems.join(' ');
      expect(combinedText).toContain('Declarative Syntax');
      expect(combinedText).toContain('Built-in State Management');

      // Code blocks
      await generatedAnswer.waitForCodeBlocks();
      const codeBlockCount = await generatedAnswer.getCodeBlockCount();
      expect(codeBlockCount).toBeGreaterThan(0);

      const codeTexts = await generatedAnswer.getCodeBlockTexts();
      const combinedCode = codeTexts.join(' ');
      expect(combinedCode).toContain('atomic-search-interface');
      expect(combinedCode).toContain('atomic-search-box');

      // Tables
      await generatedAnswer.waitForTables();
      const tableCount = await generatedAnswer.getTableCount();
      expect(tableCount).toBeGreaterThan(0);

      const tableTexts = await generatedAnswer.getTableTexts();
      const combinedTable = tableTexts.join(' ');
      expect(combinedTable).toContain('atomic-search-box');
      expect(combinedTable).toContain('atomic-result-list');
    });
  });
});
