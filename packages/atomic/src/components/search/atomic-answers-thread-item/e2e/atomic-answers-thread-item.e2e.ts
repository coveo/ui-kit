import {expect, test} from './fixture';

test.describe('atomic-answers-thread-item', () => {
  test('should toggle expanded state when collapsible', async ({
    answersThreadItem,
  }) => {
    await answersThreadItem.load({story: 'collapsed'});

    await test.step('verify collapsed state', async () => {
      await expect(answersThreadItem.titleButton).toHaveAttribute(
        'aria-expanded',
        'false'
      );
      await expect(answersThreadItem.content).toHaveText('');
    });

    await test.step('expand the item', async () => {
      await answersThreadItem.titleButton.click();
      await expect(answersThreadItem.titleButton).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      await expect(answersThreadItem.content).toContainText(
        'Safeguards against misinformation'
      );
    });
  });

  test('should hide the timeline line when configured', async ({
    answersThreadItem,
  }) => {
    await answersThreadItem.load({story: 'hide-line'});

    await expect(answersThreadItem.timelineLine).toHaveCount(0);
  });
});
