import {expect, test} from './fixture';

test.describe('atomic-result-badge', () => {
  test.describe('when rendering with a field', () => {
    test.beforeEach(async ({resultBadge}) => {
      await resultBadge.load({args: {field: 'filetype'}});
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

    test('should be accessible', async ({resultBadge}) => {
      await expect(resultBadge.hydrated.first()).toBeVisible();
      // Badge should have appropriate ARIA semantics
      const badge = resultBadge.badgeElement.first();
      await expect(badge).toBeVisible();
    });
  });

  test.describe('when rendering with a label', () => {
    test.beforeEach(async ({resultBadge}) => {
      await resultBadge.load({args: {label: 'trending'}});
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
      await resultBadge.load({
        args: {label: 'trending', icon: 'assets://star'},
      });
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

  test.describe('when rendering without icon', () => {
    test.beforeEach(async ({resultBadge}) => {
      await resultBadge.load({args: {label: 'trending'}});
      await resultBadge.hydrated.first().waitFor();
    });

    test('should not render the badge icon', async ({resultBadge}) => {
      await expect(resultBadge.badgeIcon).toHaveCount(0);
    });

    test('should render the label', async ({resultBadge}) => {
      await expect(resultBadge.textContent.first()).toBeVisible();
    });
  });

  test.describe('styling and parts', () => {
    test.beforeEach(async ({resultBadge}) => {
      await resultBadge.load({args: {field: 'filetype'}});
      await resultBadge.hydrated.first().waitFor();
    });

    test('should expose result-badge-element part', async ({resultBadge}) => {
      const element = resultBadge.badgeElement.first();
      await expect(element).toBeVisible();
      const part = await element.getAttribute('part');
      expect(part).toBe('result-badge-element');
    });

    test('should expose result-badge-label part', async ({resultBadge}) => {
      const label = resultBadge.badgeLabel.first();
      await expect(label).toBeVisible();
      const part = await label.getAttribute('part');
      expect(part).toBe('result-badge-label');
    });
  });
});
