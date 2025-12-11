import {expect, test} from './fixture';

test.describe('atomic-result-table-placeholder', () => {
  test.describe('default state', () => {
    test.beforeEach(async ({placeholder}) => {
      await placeholder.load({story: 'default'});
      await placeholder.hydrated.waitFor();
    });

    test('should be accessible', async ({placeholder}) => {
      await expect(placeholder.hydrated).toHaveAccessibleName('', {
        exact: true,
      });
    });

    test('should render table structure', async ({placeholder}) => {
      await expect(placeholder.table).toBeVisible();
      await expect(placeholder.thead).toBeVisible();
      await expect(placeholder.tbody).toBeVisible();
    });

    test('should render header row', async ({placeholder}) => {
      await expect(placeholder.headerRows).toHaveCount(1);
    });

    test('should render 3 header cells', async ({placeholder}) => {
      await expect(placeholder.headerCells).toHaveCount(3);
    });

    test('should render 3 body rows by default', async ({placeholder}) => {
      const rowCount = await placeholder.getRowCount();
      expect(rowCount).toBe(3);
    });

    test('should have aria-hidden on thead', async ({placeholder}) => {
      await expect(placeholder.thead).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test.describe('with single row', () => {
    test.beforeEach(async ({placeholder}) => {
      await placeholder.load({
        story: 'single-row',
      });
      await placeholder.hydrated.waitFor();
    });

    test('should render 1 body row', async ({placeholder}) => {
      const rowCount = await placeholder.getRowCount();
      expect(rowCount).toBe(1);
    });
  });

  test.describe('with many rows', () => {
    test.beforeEach(async ({placeholder}) => {
      await placeholder.load({
        story: 'many-rows',
      });
      await placeholder.hydrated.waitFor();
    });

    test('should render 10 body rows', async ({placeholder}) => {
      const rowCount = await placeholder.getRowCount();
      expect(rowCount).toBe(10);
    });
  });

  test.describe('with comfortable density', () => {
    test.beforeEach(async ({placeholder}) => {
      await placeholder.load({
        story: 'comfortable-density',
      });
      await placeholder.hydrated.waitFor();
    });

    test('should apply comfortable density class', async ({placeholder}) => {
      await expect(placeholder.table).toHaveClass(/density-comfortable/);
    });

    test('should render 5 body rows', async ({placeholder}) => {
      const rowCount = await placeholder.getRowCount();
      expect(rowCount).toBe(5);
    });
  });

  test.describe('with compact density', () => {
    test.beforeEach(async ({placeholder}) => {
      await placeholder.load({
        story: 'compact-density',
      });
      await placeholder.hydrated.waitFor();
    });

    test('should apply compact density class', async ({placeholder}) => {
      await expect(placeholder.table).toHaveClass(/density-compact/);
    });
  });

  test.describe('with large images', () => {
    test.beforeEach(async ({placeholder}) => {
      await placeholder.load({
        story: 'large-images',
      });
      await placeholder.hydrated.waitFor();
    });

    test('should apply large image size class', async ({placeholder}) => {
      await expect(placeholder.table).toHaveClass(/image-large/);
    });
  });

  test.describe('with no images', () => {
    test.beforeEach(async ({placeholder}) => {
      await placeholder.load({
        story: 'no-images',
      });
      await placeholder.hydrated.waitFor();
    });

    test('should apply none image size class', async ({placeholder}) => {
      await expect(placeholder.table).toHaveClass(/image-none/);
    });
  });
});
