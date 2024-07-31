import {test, expect} from './fixture';

test.beforeEach(async ({tabManager}) => {
  await tabManager.load();
  await tabManager.hydrated.waitFor();
});

test.describe('when viewport is large enough to display all tabs', () => {
  test('should be A11y compliant', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should display tabs area', async ({tabManager}) => {
    await expect(tabManager.tabArea).toBeVisible();
  });

  test('should not display tabs dropdown', async ({tabManager}) => {
    await expect(tabManager.tabDropdown).not.toBeVisible();
  });

  test('should display tab buttons for each atomic-tab elements', async ({
    tabManager,
  }) => {
    await expect(tabManager.tabDropdown).not.toBeVisible();

    expect(await tabManager.tabButtons().allTextContents()).toEqual([
      'All',
      'Articles',
      'Documentation',
    ]);
  });

  test.describe('when clicking on tab button', () => {
    test.beforeEach(async ({tabManager}) => {
      await tabManager.tabButtons('Articles').click();
    });

    test('should change active tab', async ({tabManager}) => {
      await expect(tabManager.activeTab).toHaveText('Articles');
    });

    test.describe('should change other component visibility', async () => {
      test('facets', async ({tabManager}) => {
        await tabManager.includedFacet.first().waitFor({state: 'visible'});
        (await tabManager.includedFacet.all()).forEach(async (facet) => {
          await expect(facet).toBeVisible();
        });
        (await tabManager.excludedFacet.all()).forEach(async (facet) => {
          await expect(facet).not.toBeVisible();
        });
      });
    });

    test.describe('when selecting previous tab', () => {
      test.beforeEach(async ({tabManager}) => {
        await tabManager.tabButtons('All').click();
      });

      test.describe('should change other component visibility', async () => {
        test('facets', async ({tabManager}) => {
          await tabManager.excludedFacet.first().waitFor({state: 'visible'});
          (await tabManager.excludedFacet.all()).forEach(async (facet) => {
            await expect(facet).toBeVisible();
          });
          (await tabManager.includedFacet.all()).forEach(async (facet) => {
            await expect(facet).not.toBeVisible();
          });
        });
      });
    });

    test.describe('when resizing viewport', () => {
      test.beforeEach(async ({page}) => {
        await page.setViewportSize({width: 300, height: 500});
      });

      test('should display tabs dropdown', async ({tabManager}) => {
        await expect(tabManager.tabDropdown).toBeVisible();
      });

      test('should hide tabs area', async ({tabManager}) => {
        await expect(tabManager.tabArea).not.toBeVisible();
      });

      test('should have the active tab selected in the dropdown', async ({
        tabManager,
      }) => {
        await expect(tabManager.tabDropdown).toHaveValue('article');
      });
    });
  });
});

test.describe('when viewport is too small to display all buttons', () => {
  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 300, height: 1000});
  });

  test('should be A11y compliant', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should not display tabs area', async ({tabManager}) => {
    await expect(tabManager.tabArea).not.toBeVisible();
  });

  test('should display tabs dropdown', async ({tabManager}) => {
    await expect(tabManager.tabDropdown).toBeVisible();
  });

  test('should display tab dropdown options for each atomic-tab elements', async ({
    tabManager,
  }) => {
    await expect(tabManager.tabDropdownOptions()).toHaveText([
      'All',
      'Articles',
      'Documentation',
    ]);
  });

  test.describe('when selecting a dropdown option', () => {
    test.beforeEach(async ({tabManager}) => {
      await tabManager.tabDropdown.selectOption('article');
    });

    test('should change active tab', async ({tabManager}) => {
      await expect(tabManager.tabDropdown).toHaveValue('article');
    });

    test.describe('should change other component visibility', async () => {
      test('facets', async ({tabManager}) => {
        await tabManager.includedFacet.first().waitFor({state: 'visible'});
        (await tabManager.includedFacet.all()).forEach(async (facet) => {
          await expect(facet).toBeVisible();
        });
        (await tabManager.excludedFacet.all()).forEach(async (facet) => {
          await expect(facet).not.toBeVisible();
        });
      });
    });

    test.describe('when selecting previous dropdown option', () => {
      test.beforeEach(async ({tabManager}) => {
        await tabManager.tabDropdown.selectOption('all');
      });

      test.describe('should change other component visibility', async () => {
        test('facets', async ({tabManager}) => {
          await tabManager.excludedFacet.first().waitFor({state: 'visible'});
          (await tabManager.excludedFacet.all()).forEach(async (facet) => {
            await expect(facet).toBeVisible();
          });
          (await tabManager.includedFacet.all()).forEach(async (facet) => {
            await expect(facet).not.toBeVisible();
          });
        });
      });
    });

    test.describe('when resizing viewport', () => {
      test.beforeEach(async ({page}) => {
        await page.setViewportSize({width: 1000, height: 500});
      });

      test('should hide tabs dropdown', async ({tabManager}) => {
        await expect(tabManager.tabDropdown).not.toBeVisible();
      });

      test('should display tabs area', async ({tabManager}) => {
        await expect(tabManager.tabArea).toBeVisible();
      });

      test('should have the active tab button selected', async ({
        tabManager,
      }) => {
        await expect(tabManager.activeTab).toHaveText('Articles');
      });
    });
  });
});
