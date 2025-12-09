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

    await expect(page.getByText('Author:')).toBeVisible();
    await expect(
      resultFieldsList.atomicText.filter({hasText: 'John Doe'})
    ).toBeVisible();

    await expect(page.getByText('Source:')).toBeVisible();
    await expect(
      resultFieldsList.atomicText.filter({hasText: 'Documentation'})
    ).toBeVisible();

    await expect(page.getByText('FileType:')).toBeVisible();
    await expect(
      resultFieldsList.atomicText.filter({hasText: 'pdf'})
    ).toBeVisible();
  });
});
