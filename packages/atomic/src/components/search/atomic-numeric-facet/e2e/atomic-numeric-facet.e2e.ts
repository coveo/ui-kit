import {expect, test} from './fixture';

test.describe('atomic-numeric-facet', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'default'});
    await facet.hydrated.waitFor();
  });

  test('should render facet with values', async ({facet}) => {
    await expect(facet.facet).toBeVisible();
    await expect(facet.facetValues.first()).toBeVisible();
  });
});

test.describe('atomic-numeric-facet with depends-on', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'with-depends-on'});
    await facet.facet.waitFor({state: 'visible'});
  });

  test('should show facet when dependency is met', async ({facet}) => {
    await expect(facet.facet).toBeVisible();
  });
});
