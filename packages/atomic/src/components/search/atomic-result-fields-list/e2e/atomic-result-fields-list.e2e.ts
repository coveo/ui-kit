import {expect, test} from './fixture';

test.describe('atomic-result-fields-list', () => {
  test.beforeEach(async ({resultFieldsList}) => {
    await resultFieldsList.load({story: 'default'});
    await resultFieldsList.hydrated.first().waitFor();
  });

  test('should render all fields with their values', async ({
    resultFieldsList,
    page,
  }) => {
    await expect(resultFieldsList.hydrated.first()).toBeVisible();

    const children = await resultFieldsList.children.all();
    expect(children.length).toBeGreaterThan(0);

    await expect(page.getByText('author')).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();

    await expect(page.getByText('source')).toBeVisible();
    await expect(page.getByText('Documentation')).toBeVisible();

    await expect(page.getByText('language')).toBeVisible();
    await expect(page.getByText('en')).toBeVisible();
    await expect(page.getByText('fr')).toBeVisible();

    await expect(page.getByText('fileType')).toBeVisible();
    await expect(page.getByText('pdf')).toBeVisible();

    await expect(page.getByText('Date:')).toBeVisible();
  });
});
