import {expect, test} from './fixture';

test.describe('render-answers-thread-item', () => {
  test('should toggle expanded state when collapsible', async ({
    answersThreadItem,
  }) => {
    await answersThreadItem.load({story: 'collapsed'});

    await test.step('verify collapsed state', async () => {
      await expect(answersThreadItem.content).toHaveAttribute('hidden', '');
    });

    await test.step('expand the item', async () => {
      await answersThreadItem.titleButton.click();
      await expect(answersThreadItem.content).not.toHaveAttribute('hidden', '');
    });
  });

  test('should hide the timeline line when configured', async ({
    answersThreadItem,
  }) => {
    await answersThreadItem.load({story: 'hide-line'});

    await expect(answersThreadItem.timelineLine).toHaveCount(0);
  });
});
