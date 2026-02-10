import {expect, test} from './fixture';

test.describe('atomic-answers-thread-item', () => {
  test.describe('default rendering', () => {
    test.beforeEach(async ({answersThreadItem}) => {
      await answersThreadItem.load({story: 'default'});
      await answersThreadItem.hydrated.waitFor();
    });

    test('should render expanded content', async ({answersThreadItem}) => {
      await test.step('verify expanded state', async () => {
        await expect(answersThreadItem.titleButton).toHaveAttribute(
          'aria-expanded',
          'true'
        );
        await expect(answersThreadItem.content).not.toHaveAttribute('hidden');
      });
    });

    test('should collapse when clicking the title button', async ({
      answersThreadItem,
    }) => {
      await test.step('collapse the item', async () => {
        await answersThreadItem.titleButton.click();
      });

      await test.step('verify collapsed state', async () => {
        await expect(answersThreadItem.titleButton).toHaveAttribute(
          'aria-expanded',
          'false'
        );
        await expect(answersThreadItem.content).toHaveAttribute('hidden');
      });
    });
  });

  test('should hide the timeline line when configured', async ({
    answersThreadItem,
  }) => {
    await test.step('load the hide-line story', async () => {
      await answersThreadItem.load({story: 'hide-line'});
      await answersThreadItem.hydrated.waitFor();
    });

    await test.step('verify the line is not rendered', async () => {
      await expect(answersThreadItem.timelineLine).toHaveCount(0);
    });
  });

  test('should render a static title when not collapsible', async ({
    answersThreadItem,
  }) => {
    await test.step('load the non-collapsible variant', async () => {
      await answersThreadItem.load({args: {isCollapsible: false}});
      await answersThreadItem.hydrated.waitFor();
    });

    await test.step('verify the static title', async () => {
      await expect(answersThreadItem.titleButton).toHaveCount(0);
      await expect(answersThreadItem.titleText).toHaveCount(1);
    });
  });
});
