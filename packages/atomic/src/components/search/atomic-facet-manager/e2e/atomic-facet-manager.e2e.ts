import {expect, test} from './fixture';

test.describe('atomic-facet-manager', () => {
  test('should render with default collapse behavior', async ({component}) => {
    await test.step('Load component with default settings', async () => {
      await component.load({story: 'default'});
      await component.page.waitForSelector('atomic-facet-manager');
    });

    await test.step('Verify component renders with facets', async () => {
      await expect(component.facets).toHaveCount(await component.facets.count());
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

  test('should not collapse facets when collapseFacetsAfter is -1', async ({component}) => {
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

  test.describe('when facets are nested inside popovers', () => {
    const orderOfFirstResponse = ['Year', 'Type', 'Language', 'Authors'];
    const orderOfSecondResponse = ['Language', 'Year', 'Authors', 'Type'];

    test('should sort the popovers like the facets of the search response', async ({component}) => {
      await component.load({story: 'with-popovers'});

      await expect(component.popoverLabels).toHaveText(orderOfFirstResponse);
    });

    test('should keep every facet inside its popover', async ({component}) => {
      await component.load({story: 'with-popovers'});
      await expect(component.popoverLabels).toHaveText(orderOfFirstResponse);

      await expect(component.facetsInPopovers).toHaveCount(4);
      await expect(component.facetsOutsidePopovers).toHaveCount(0);
    });

    test('should sort the popovers again when the order of the facets changes, keeping the open popover usable', async ({
      component,
    }) => {
      await test.step('Open a popover and select one of its values', async () => {
        await component.load({story: 'with-popovers'});
        await expect(component.popoverLabels).toHaveText(orderOfFirstResponse);

        await component.popoverButtons.filter({hasText: 'Language'}).click();
        await component.page.getByRole('checkbox', {name: /English/}).click();
      });

      await test.step('Verify the popovers follow the new order', async () => {
        await expect(component.popoverLabels).toHaveText(orderOfSecondResponse);
      });

      await test.step('Verify the open popover still displays its facet', async () => {
        await expect(component.page.getByRole('checkbox', {name: /Spanish/})).toBeVisible();
      });
    });

    test('should lay the popovers out in a single row on desktop', async ({component}) => {
      await component.load({story: 'with-popovers'});
      await expect(component.popoverLabels).toHaveText(orderOfFirstResponse);

      await expect
        .poll(() =>
          component.popovers.evaluateAll((popovers) => {
            const boxes = popovers.map((popover) => popover.getBoundingClientRect());
            const isSingleRow = new Set(boxes.map(({top}) => top)).size === 1;
            const areSpaced = boxes.slice(1).every(({left}, index) => left > boxes[index].right);
            return isSingleRow && areSpaced;
          })
        )
        .toBe(true);
    });

    test('should hide the popovers on mobile', async ({component}) => {
      await component.page.setViewportSize({width: 600, height: 800});
      await component.load({story: 'with-popovers'});
      await expect(component.popoverButtons).toHaveCount(4);

      await expect(component.visiblePopovers).toHaveCount(0);
    });

    test('should refresh the popovers when the language changes after they are sorted', async ({
      component,
    }) => {
      const yearPopoverButton = component.popoverButtons.filter({hasText: 'Year'});
      await component.load({story: 'with-popovers'});
      await expect(component.popoverLabels).toHaveText(orderOfFirstResponse);
      await expect(yearPopoverButton).toHaveAccessibleName('Popover menu for the Year facet');

      await component.page.locator('atomic-search-interface').evaluate((searchInterface) => {
        searchInterface.setAttribute('language', 'fr');
      });

      await expect(yearPopoverButton).toHaveAccessibleName('Menu contextuel de la facette Year');
      await yearPopoverButton.click();
      await expect(
        component.page.getByRole('button', {name: /Filtre d.inclusion sur 2024/})
      ).toBeVisible();
    });

    test('should never collapse the facets of the popovers', async ({component}) => {
      await component.load({story: 'with-popovers', args: {'collapse-facets-after': 1}});
      await expect(component.popoverLabels).toHaveText(orderOfFirstResponse);

      await component.popoverButtons.filter({hasText: 'Authors'}).click();

      await expect(component.page.getByRole('checkbox', {name: /Alice Johnson/})).toBeVisible();
    });
  });
});
