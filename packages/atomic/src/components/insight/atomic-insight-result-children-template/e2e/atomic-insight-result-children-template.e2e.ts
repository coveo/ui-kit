import {expect, test} from './fixture';

test.describe('atomic-insight-result-children-template', () => {
  test('should display child results', async ({resultChildrenTemplate}) => {
    await resultChildrenTemplate.load({story: 'default'});

    await expect(resultChildrenTemplate.childrenRoot.first()).toBeVisible();
    await expect(resultChildrenTemplate.childResult).toBeVisible();
  });

  test('should display nested grandchild results', async ({
    resultChildrenTemplate,
  }) => {
    await resultChildrenTemplate.load({story: 'with-nested-children'});

    await expect(resultChildrenTemplate.childrenRoot.first()).toBeVisible();
    await expect(resultChildrenTemplate.childResult).toBeVisible();
    await expect(resultChildrenTemplate.grandchildResult).toBeVisible();
  });

  test('should display child results when conditions are applied', async ({
    resultChildrenTemplate,
  }) => {
    await resultChildrenTemplate.load({story: 'with-conditions'});

    await expect(resultChildrenTemplate.childrenRoot.first()).toBeVisible();
    await expect(resultChildrenTemplate.childResult).toBeVisible();
  });
});
