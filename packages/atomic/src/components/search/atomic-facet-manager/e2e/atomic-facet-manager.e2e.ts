import {expect, test} from './fixture';

test.describe('atomic-facet-manager', () => {
  test('should render with default collapse behavior', async ({component}) => {
    await test.step('Load component with default settings', async () => {
      await component.load({story: 'default'});
      await component.page.waitForSelector('atomic-facet-manager');
    });

    await test.step('Verify component renders with facets', async () => {
      await expect(component.facets).toHaveCount(
        await component.facets.count()
      );
      await expect(component.collapsedFacets).toHaveCount(0);
    });
  });

  test('should manage facet visibility', async ({component}) => {
    await test.step('Load component', async () => {
      await component.load({story: 'default'});
      await component.page.waitForSelector('atomic-facet-manager');
    });

    await test.step('Verify facets are visible', async () => {
      const facetCount = await component.facets.count();
      await expect(component.facets).toHaveCount(facetCount);
      expect(facetCount).toBeGreaterThan(0);
    });
  });

  test('should respect collapseFacetsAfter attribute', async ({component}) => {
    await test.step('Load component with custom collapse setting', async () => {
      await component.load({
        story: 'default',
        args: {'collapse-facets-after': 2},
      });
      await component.page.waitForSelector('atomic-facet-manager');
    });

    await test.step('Verify collapse behavior is applied', async () => {
      const totalFacets = await component.facets.count();
      const collapsedCount = await component.collapsedFacets.count();
      const expandedCount = await component.expandedFacets.count();

      expect(expandedCount).toBeLessThanOrEqual(2);
      expect(collapsedCount).toBeGreaterThan(0);
      expect(expandedCount + collapsedCount).toBe(totalFacets);
    });
  });

  test('should not collapse facets when collapseFacetsAfter is -1', async ({
    component,
  }) => {
    await test.step('Load component with collapse disabled', async () => {
      await component.load({
        story: 'default',
        args: {'collapse-facets-after': -1},
      });
      await component.page.waitForSelector('atomic-facet-manager');
    });

    await test.step('Verify all facets remain expanded', async () => {
      await expect(component.collapsedFacets).toHaveCount(0);
      const facetCount = await component.facets.count();
      expect(facetCount).toBeGreaterThan(0);
    });
  });
});
