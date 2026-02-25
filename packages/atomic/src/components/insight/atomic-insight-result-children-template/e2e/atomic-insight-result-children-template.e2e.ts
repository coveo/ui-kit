import {expect, test} from './fixture';

test.describe('atomic-insight-result-children-template', () => {
  test('should display child results when a child of result children', async ({
    resultChildrenTemplate,
  }) => {
    await resultChildrenTemplate.load({story: 'default'});

    await expect(resultChildrenTemplate.childrenRoot.first()).toBeVisible();
    await expect(resultChildrenTemplate.childResult).toBeVisible();
  });

  test('should display child results with conditions applied', async ({
    resultChildrenTemplate,
  }) => {
    await resultChildrenTemplate.load({story: 'with-conditions'});

    await expect(resultChildrenTemplate.childrenRoot.first()).toBeVisible();
    await expect(resultChildrenTemplate.childResult).toBeVisible();
  });

  test('should display nested children', async ({resultChildrenTemplate}) => {
    await resultChildrenTemplate.load({story: 'with-nested-children'});

    await expect(resultChildrenTemplate.childrenRoot.first()).toBeVisible();
    await expect(resultChildrenTemplate.childResult).toBeVisible();
  });
});
