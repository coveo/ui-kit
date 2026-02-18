import {expect, test} from './fixture';

test.describe('atomic-insight-smart-snippet-suggestions', () => {
  test.beforeEach(async ({smartSnippetSuggestions}) => {
    await smartSnippetSuggestions.load();
    await smartSnippetSuggestions.hydrated.waitFor();
  });

  test('should render the component', async ({smartSnippetSuggestions}) => {
    await expect(smartSnippetSuggestions.container).toBeVisible();
    await expect(smartSnippetSuggestions.heading).toHaveText('People also ask');
    await expect(
      smartSnippetSuggestions.collapsedQuestionButtons.first()
    ).toBeVisible();
  });
});
