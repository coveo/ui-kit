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
    await expect(tabManager.tabsArea).toBeVisible();
  });

  test('should not display tabs dropdown', async ({tabManager}) => {
    await expect(tabManager.tabDropdown).not.toBeVisible();
  });

  test('should display tab buttons for each atomic-tab elements', async ({
    tabManager,
  }) => {
    const atomicTabElements = tabManager.atomicTabElements();
    expect(tabManager.tabDropdown).not.toBeVisible();

    for (let i = 0; i < (await atomicTabElements.count()); i++) {
      const tabElement = atomicTabElements.nth(i);
      const button = tabManager.tabButtons().nth(i);

      button.waitFor({state: 'visible'});

      const expectedName = await tabElement.getAttribute('Label');
      const buttonText = await button.textContent();

      expect(buttonText).toContain(expectedName);
    }
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
      const tabLabel = await tabButton.textContent();

      const activeTabName = await tabManager.activeTab.textContent();

      expect(activeTabName).toBe(tabLabel);
    });

    test.describe('should change other component visibility', async () => {
      test('facets', async ({tabManager}) => {
        expect(tabManager.excludedFacet).not.toBeVisible();
        expect(tabManager.includedFacet).toBeVisible();
      });
      test('smart snippet', async ({tabManager}) => {
        expect(tabManager.smartSnippet).toBeVisible();
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
        await expect(tabManager.tabsArea).not.toBeVisible();
      });

      test('should have the active tab selected in the dropdown', async ({
        tabManager,
      }) => {
        const activeTabName = await tabManager.activeTab.textContent();
        const selectedOption = await tabManager.tabDropdown.textContent();

        expect(selectedOption).toContain(activeTabName);
      });
    });
  });
});

test.describe('when viewport is too small to display all buttons', () => {
  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 300, height: 500});
  });

  test('should be A11y compliant', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should not display tabs area', async ({tabManager}) => {
    await expect(tabManager.tabsArea).not.toBeVisible();
  });

  test('should display tabs dropdown', async ({tabManager}) => {
    await expect(tabManager.tabDropdown).toBeVisible();
  });

  test('should display tab dropdown options for each atomic-tab elements', async ({
    tabManager,
  }) => {
    tabManager.tabDropdown.waitFor({state: 'visible'});

    const atomicTabElements = tabManager.atomicTabElements();

    for (let i = 0; i < (await atomicTabElements.count()); i++) {
      const tabElement = atomicTabElements.nth(i);
      const option = tabManager.tabDropdownOptions().nth(i);

      const expectedName = await tabElement.getAttribute('Label');
      const optionText = await option.textContent();

      expect(optionText).toContain(expectedName);
    }
  });

  test.describe('when selecting a dropdown option', () => {
    let tabOption: Locator;

    test.beforeEach(async ({tabManager, facets}) => {
      tabOption = tabManager.tabDropdownOptions('article');
      await tabManager.tabDropdown.selectOption('article');
      await facets.inclusionFilters.first().click();
      await facets.clearFilters().waitFor({state: 'visible'});
    });

    test('should change active tab', async ({tabManager}) => {
      const tabLabel = await tabOption.textContent();

      const activeTabName = await tabManager.activeTab.textContent();

      expect(activeTabName).toBe(tabLabel);
    });

    test.describe('should change other component visibility', async () => {
      test('facets', async ({tabManager}) => {
        expect(tabManager.includedFacet).toBeVisible();
        expect(tabManager.excludedFacet).not.toBeVisible();
      });

      test('smart snippet', async ({tabManager}) => {
        expect(tabManager.smartSnippet).toBeVisible();
      });
    });

    test.describe('when selecting previous dropdown option', () => {
      test.beforeEach(async ({tabManager}) => {
        await tabManager.tabDropdown.selectOption('all');
      });

      test.describe('should change other component visibility', async () => {
        test('facets', async ({tabManager}) => {
          expect(tabManager.includedFacet).not.toBeVisible();
          expect(tabManager.excludedFacet).toBeVisible();
        });

        test('smart snippet', async ({tabManager}) => {
          expect(tabManager.smartSnippet).not.toBeVisible();
        });
      });
    });
    test.describe('when resizing viewport', () => {
      test.beforeEach(async ({page}) => {
        await page.setViewportSize({width: 1000, height: 500});
      });

      test('should display tabs dropdown', async ({tabManager}) => {
        await expect(tabManager.tabDropdown).not.toBeVisible();
      });

      test('should hide tabs area', async ({tabManager}) => {
        await expect(tabManager.tabsArea).toBeVisible();
      });

      test('should have the active tab button selected', async ({
        tabManager,
      }) => {
        const activeTabName = await tabManager.activeTab.textContent();
        const selectedOption = await tabManager.tabDropdown.textContent();

        expect(selectedOption).toContain(activeTabName);
      });
    });
  });
});
