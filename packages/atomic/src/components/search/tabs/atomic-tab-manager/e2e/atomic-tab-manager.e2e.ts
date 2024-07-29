import {Locator} from '@playwright/test';
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
    expect(tabManager.tabDropdown).not.toBeVisible();

    expect(tabManager.tabButtons()).toHaveText([
      'All',
      'Articles',
      'Documentation',
    ]);
  });

  test.describe('when clicking on tab button', () => {
    let tabButton: Locator;

    test.beforeEach(async ({tabManager, facets}) => {
      tabButton = tabManager.tabButtons('article');
      await tabButton.click();
      await facets.inclusionFilters.first().click();
      await facets.clearFilters().waitFor({state: 'visible'});
    });

    test('should change active tab', async ({tabManager}) => {
      expect(tabManager.tabButtons('article')).toHaveClass(/active-tab/);
    });

    test.describe('should change other component visibility', async () => {
      test('facets', async ({tabManager}) => {
        expect(tabManager.excludedFacet).not.toBeVisible();
        expect(tabManager.includedFacet).toBeVisible();
      });
      test('smart snippet', async ({tabManager}) => {
        expect(tabManager.smartSnippet).toBeVisible();
      });
      test('sort dropdown', async ({tabManager}) => {
        const expectedOptions = ['Most Recent', 'Least Recent', 'Relevance'];
        const options = await tabManager.sortDropdownOptions.allTextContents();
        expect(options).toEqual(expectedOptions);
      });
    });

    test.describe('when selecting previous tab', () => {
      test.beforeEach(async ({tabManager}) => {
        await tabManager.tabButtons('all').click();
      });

      test.describe('should change other component visibility', async () => {
        test('facets', async ({tabManager}) => {
          expect(tabManager.excludedFacet).toBeVisible();
          expect(tabManager.includedFacet).not.toBeVisible();
        });
        test('smart snippet', async ({tabManager}) => {
          expect(tabManager.smartSnippet).not.toBeVisible();
        });
        test('sort dropdown', async ({tabManager}) => {
          const expectedOptions = [
            'Name descending',
            'Name ascending',
            'Relevance',
          ];
          const options =
            await tabManager.sortDropdownOptions.allTextContents();
          expect(options).toEqual(expectedOptions);
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
        expect(tabManager.tabDropdown).toHaveValue('article');
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
    await tabManager.tabDropdown.waitFor({state: 'visible'});

    expect(tabManager.tabDropdownOptions()).toHaveText([
      'All',
      'Articles',
      'Documentation',
    ]);
  });

  test.describe('when selecting a dropdown option', () => {
    test.beforeEach(async ({tabManager, facets}) => {
      await tabManager.tabDropdown.selectOption('article');
      await facets.inclusionFilters.first().click();
      await facets.clearFilters().waitFor({state: 'visible'});
    });

    test('should change active tab', async ({tabManager}) => {
      expect(tabManager.tabDropdown).toHaveValue('article');
    });

    test.describe('should change other component visibility', async () => {
      test('facets', async ({tabManager}) => {
        expect(tabManager.includedFacet).toBeVisible();
        expect(tabManager.excludedFacet).not.toBeVisible();
      });
      test('smart snippet', async ({tabManager}) => {
        expect(tabManager.smartSnippet).toBeVisible();
      });
      test('sort dropdown', async ({tabManager}) => {
        const expectedOptions = ['Most Recent', 'Least Recent', 'Relevance'];
        tabManager.refineModalButton.click();
        await tabManager.refineModalHeader.waitFor({state: 'visible'});
        const options =
          await tabManager.refineModalSortDropdownOptions.allTextContents();
        expect(options).toEqual(expectedOptions);
      });
    });

    test.describe('when selecting previous dropdown option', () => {
      test.beforeEach(async ({tabManager, facets}) => {
        await tabManager.tabDropdown.selectOption('all');
        await facets.inclusionFilters.first().click();
        await facets.clearFilters().waitFor({state: 'visible'});
      });

      test.describe('should change other component visibility', async () => {
        test('facets', async ({tabManager}) => {
          expect(tabManager.includedFacet).not.toBeVisible();
          expect(tabManager.excludedFacet).toBeVisible();
        });
        test('smart snippet', async ({tabManager}) => {
          expect(tabManager.smartSnippet).not.toBeVisible();
        });

        test('sort dropdown', async ({tabManager}) => {
          const expectedOptions = [
            'Name descending',
            'Name ascending',
            'Relevance',
          ];
          tabManager.refineModalButton.click();
          await tabManager.refineModalHeader.waitFor({state: 'visible'});
          const options =
            await tabManager.refineModalSortDropdownOptions.allTextContents();
          expect(options).toEqual(expectedOptions);
        });
      });
    });

    test.describe('when resizing viewport', () => {
      test.beforeEach(async ({page, tabManager}) => {
        await page.setViewportSize({width: 1000, height: 500});
        await tabManager.tabArea.waitFor({state: 'visible'});
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
        expect(tabManager.tabButtons('article')).toHaveClass(/active-tab/);
      });
    });
  });
});
