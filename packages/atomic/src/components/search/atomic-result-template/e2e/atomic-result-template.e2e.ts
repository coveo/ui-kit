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

  test('should apply to each result the template whose if-defined or if-not-defined condition it meets', async ({
    resultTemplate,
  }) => {
    await resultTemplate.load({story: 'with-defined-conditions'});

    await expect(resultTemplate.badge('Language defined')).toHaveCount(6);
    await expect(resultTemplate.badge('Language not defined')).toHaveCount(4);
  });
});
