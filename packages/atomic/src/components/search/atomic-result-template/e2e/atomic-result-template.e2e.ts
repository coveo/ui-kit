import {expect, test} from './fixture';

test.describe('atomic-result-template', async () => {
  test('should display atomic result components when a child of a result list', async ({
    resultTemplate,
  }) => {
    await resultTemplate.load({story: 'default'});

    await expect(resultTemplate.result).toBeVisible();
  });

  test('should display atomic result components when a child of a folded result list', async ({
    resultTemplate,
  }) => {
    await resultTemplate.load({story: 'in-a-folded-result-list'});

    await expect(resultTemplate.result).toBeVisible();
  });

  test('should display atomic result components when a child of a search box instant results', async ({
    resultTemplate,
  }) => {
    await resultTemplate.load({story: 'in-a-search-box-instant-results'});

    await expect(resultTemplate.result).toBeVisible();
  });
});
