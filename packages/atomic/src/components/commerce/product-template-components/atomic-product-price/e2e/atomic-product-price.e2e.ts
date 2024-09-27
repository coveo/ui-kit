import {test, expect} from './fixture';

test('test', () => {
  expect(true).toBe(true);
});

test.describe('when there is no promotional price', async () => {
  test('should render the price', async () => {});
  test('should add a line-through style to the price', async () => {});
  test('should not render the promotional price', async () => {});
});

test.describe('when there is a promotional price', async () => {
  test('should render the original price with a line-through style', async () => {});
  test('should render the promotional price', async () => {});
  test('should only render if the promotional price is lower than the original price', async () => {});
});

test.describe('when there is a different currency', async () => {
  test('should render the price in the correct currency', async () => {});
  test('should render the original price in the correct currency', async () => {});
});

test('should handle errors during value parsing', async () => {
  // Test how the component behaves if an error occurs during parsing
});

test('should handle errors during value formatting', async () => {
  // Test how the component behaves if an error occurs during formatting
});

test('should display a fallback value if an error occurs', async () => {
  // Test that a fallback value is shown if an error occurs
});

test('should update the price when the currency changes', async () => {
  // Test that the price is updated when the currency changes
});
