import {expect, test} from './fixture';

test.describe('atomic-result-children-template', async () => {
  test('should display child result components when a child of a folded result list', async ({
    resultChildrenTemplate,
  }) => {
    await resultChildrenTemplate.load({story: 'default'});

    await expect(resultChildrenTemplate.childResult).toBeVisible();
  });

  test('should display folded result list with children templates', async ({
    resultChildrenTemplate,
  }) => {
    await resultChildrenTemplate.load({story: 'default'});

    await expect(resultChildrenTemplate.foldedResultList).toBeVisible();
  });

  test('should not display error when children template is properly configured', async ({
    resultChildrenTemplate,
  }) => {
    await resultChildrenTemplate.load({story: 'default'});

    await expect(resultChildrenTemplate.error).not.toBeVisible();
  });
});
