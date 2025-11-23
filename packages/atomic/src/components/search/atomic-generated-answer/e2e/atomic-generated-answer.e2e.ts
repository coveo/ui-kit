import {expect, test} from './fixture';

test.describe('atomic-generated-answer', () => {
  test.describe('citations', () => {
    test.describe('with citation anchoring enabled', () => {
      test.beforeEach(async ({generatedAnswer}) => {
        await generatedAnswer.load({story: 'default'});
        await generatedAnswer.waitForCitations();
      });

      test('should render citation when available', async ({
        generatedAnswer,
      }) => {
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

          expect(href).toBeTruthy();

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
      }) => {
        await generatedAnswer.waitForCitations();
        const href = await generatedAnswer.getCitationHref(0);

        expect(href).toBeTruthy();
        expect(href).not.toContain('#:~:text=');
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
