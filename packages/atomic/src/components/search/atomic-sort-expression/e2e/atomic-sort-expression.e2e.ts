import {expect, test} from './fixture';

test.describe('atomic-sort-expression', () => {
  test.beforeEach(async ({sortExpression}) => {
    await sortExpression.load();
  });

  test('should be accessible', async ({sortExpression}) => {
    await sortExpression.hydrated.waitFor({state: 'visible'});

    const sortDropdown = sortExpression.sortDropdown;
    await expect(sortDropdown).toBeVisible();

    // Check that the dropdown button is keyboard accessible
    const dropdownButton = sortExpression.sortDropdownButton;
    await expect(dropdownButton).toBeVisible();
    await expect(dropdownButton).toHaveAttribute('role', /button|combobox/i);
  });

  test('should display within atomic-sort-dropdown', async ({
    sortExpression,
  }) => {
    await sortExpression.hydrated.waitFor({state: 'visible'});

    const sortDropdown = sortExpression.sortDropdown;
    await expect(sortDropdown).toBeVisible();

    const sortExpressionElement = sortExpression.hydrated;
    await expect(sortExpressionElement).toBeVisible();

    // Verify the sort expression is a child of the dropdown
    const isChildOfDropdown = await sortExpressionElement.evaluate(
      (el) => el.closest('atomic-sort-dropdown') !== null
    );
    expect(isChildOfDropdown).toBe(true);
  });

  test('should have correct label attribute', async ({sortExpression}) => {
    await sortExpression.hydrated.waitFor({state: 'visible'});

    const label = await sortExpression.hydrated.getAttribute('label');
    expect(label).toBeTruthy();
    expect(typeof label).toBe('string');
  });

  test('should have correct expression attribute', async ({sortExpression}) => {
    await sortExpression.hydrated.waitFor({state: 'visible'});

    const expression = await sortExpression.hydrated.getAttribute('expression');
    expect(expression).toBeTruthy();
    expect(typeof expression).toBe('string');
  });

  test('should support tabs-included attribute', async ({
    sortExpression,
    page,
  }) => {
    const url =
      './iframe.html?args=tabs-included:["all"]&id=atomic-sort-expression--with-tabs-included&viewMode=story';
    await page.goto(url);
    await sortExpression.hydrated.waitFor({state: 'visible', timeout: 10000});

    const tabsIncluded =
      await sortExpression.hydrated.getAttribute('tabs-included');
    expect(tabsIncluded).toBeTruthy();
  });

  test('should support tabs-excluded attribute', async ({
    sortExpression,
    page,
  }) => {
    const url =
      './iframe.html?args=tabs-excluded:["images"]&id=atomic-sort-expression--with-tabs-excluded&viewMode=story';
    await page.goto(url);
    await sortExpression.hydrated.waitFor({state: 'visible', timeout: 10000});

    const tabsExcluded =
      await sortExpression.hydrated.getAttribute('tabs-excluded');
    expect(tabsExcluded).toBeTruthy();
  });

  test('should work with different sort expressions', async ({
    sortExpression,
    page,
  }) => {
    const url =
      './iframe.html?args=&id=atomic-sort-expression--date-descending&viewMode=story';
    await page.goto(url);
    await sortExpression.hydrated.waitFor({state: 'visible', timeout: 10000});

    const expression = await sortExpression.hydrated.getAttribute('expression');
    expect(expression).toContain('date descending');
  });

  test('should work with complex expressions', async ({
    sortExpression,
    page,
  }) => {
    const url =
      './iframe.html?args=&id=atomic-sort-expression--complex-expression&viewMode=story';
    await page.goto(url);
    await sortExpression.hydrated.waitFor({state: 'visible', timeout: 10000});

    const expression = await sortExpression.hydrated.getAttribute('expression');
    expect(expression).toContain(',');
  });
});
