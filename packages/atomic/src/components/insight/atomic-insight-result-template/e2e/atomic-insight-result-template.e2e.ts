import {expect, test} from './fixture';

test.describe('atomic-insight-result-template', () => {
  test('should display results when a child of a result list', async ({
    resultTemplate,
  }) => {
    await resultTemplate.load({story: 'default'});

    await expect(resultTemplate.result).toBeVisible();
  });

  test('should display results when a child of a folded result list', async ({
    resultTemplate,
  }) => {
    await resultTemplate.load({story: 'in-a-folded-result-list'});

    await expect(resultTemplate.result).toBeVisible();
  });

  test('should display results with conditions applied', async ({
    resultTemplate,
  }) => {
    await resultTemplate.load({story: 'with-conditions'});

    await expect(resultTemplate.result).toBeVisible();
  });
});
