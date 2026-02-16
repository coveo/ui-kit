import {expect, test} from './fixture';

test.describe('atomic-result-badge', () => {
  test.describe('when rendering with a field', () => {
    test.beforeEach(async ({resultBadge}) => {
      await resultBadge.load({story: 'default'});
      await resultBadge.hydrated.first().waitFor();
    });

    test('should render the badge element', async ({resultBadge}) => {
      await expect(resultBadge.badgeElement.first()).toBeVisible();
    });

    test('should render the badge label', async ({resultBadge}) => {
      await expect(resultBadge.badgeLabel.first()).toBeVisible();
    });

    test('should render atomic-result-text with the field', async ({
      resultBadge,
    }) => {
      await expect(resultBadge.resultTextField.first()).toBeVisible();
    });
  });

  test.describe('when rendering with a label', () => {
    test.beforeEach(async ({resultBadge}) => {
      await resultBadge.load({story: 'with-label'});
      await resultBadge.hydrated.first().waitFor();
    });

    test('should render the badge element', async ({resultBadge}) => {
      await expect(resultBadge.badgeElement.first()).toBeVisible();
    });

    test('should render atomic-text with the label', async ({resultBadge}) => {
      await expect(resultBadge.textContent.first()).toBeVisible();
    });

    test('should not render atomic-result-text', async ({resultBadge}) => {
      await expect(resultBadge.resultTextField).toHaveCount(0);
    });
  });

  test.describe('when rendering with an icon', () => {
    test.beforeEach(async ({resultBadge}) => {
      await resultBadge.load({story: 'with-icon'});
      await resultBadge.hydrated.first().waitFor();
    });

    test('should render the badge icon', async ({resultBadge}) => {
      await expect(resultBadge.badgeIcon.first()).toBeVisible();
    });

    test('should render both icon and label', async ({resultBadge}) => {
      await expect(resultBadge.badgeIcon.first()).toBeVisible();
      await expect(resultBadge.textContent.first()).toBeVisible();
    });
  });
});
