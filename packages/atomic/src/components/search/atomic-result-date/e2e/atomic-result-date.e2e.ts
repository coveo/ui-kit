import {expect, test} from './fixture';

test.describe('atomic-result-date', () => {
  test('should render the date field with default format', async ({
    resultDate,
  }) => {
    await resultDate.load({args: {field: 'date'}});
    await resultDate.hydrated.first().waitFor();

    const dateText = await resultDate.dateContent.first().textContent();
    expect(dateText).toBeTruthy();
    // Date should match some date pattern
    expect(dateText).toMatch(/\d+/);
  });

  test('should render the date field with custom format', async ({
    resultDate,
  }) => {
    await resultDate.load({args: {field: 'date', format: 'YYYY-MM-DD'}});
    await resultDate.hydrated.first().waitFor();

    const dateText = await resultDate.dateContent.first().textContent();
    expect(dateText).toBeTruthy();
    // Custom format should show YYYY-MM-DD pattern
    expect(dateText).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
