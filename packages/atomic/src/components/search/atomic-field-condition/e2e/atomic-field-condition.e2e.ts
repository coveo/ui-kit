import {expect, test} from './fixture';

test.describe('atomic-field-condition', () => {
  test.beforeEach(async ({fieldCondition}) => {
    await fieldCondition.load();
    await fieldCondition.hydrated.first().waitFor();
  });

  test('should render its content when if-defined condition is met', async ({
    fieldCondition,
  }) => {
    await fieldCondition.load({args: {'if-defined': 'excerpt'}});
    await fieldCondition.hydrated.first().waitFor();

    const visibleCount = await fieldCondition.visibleCondition.count();
    expect(visibleCount).toBeGreaterThan(0);
  });

  test('should render its content when must-match condition is met', async ({
    fieldCondition,
  }) => {
    await fieldCondition.load({args: {'must-match-filetype': 'pdf'}});
    await fieldCondition.hydrated.first().waitFor();

    const visibleCount = await fieldCondition.visibleCondition.count();
    expect(visibleCount).toBeGreaterThan(0);
  });

  test('should not render its content when if-not-defined condition is not met', async ({
    fieldCondition,
  }) => {
    await fieldCondition.load({args: {'if-not-defined': 'title'}});

    expect(fieldCondition.hydrated).not.toBeVisible;
  });
});
