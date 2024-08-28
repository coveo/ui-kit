import {test, expect} from './fixture';

test.describe('AtomicTabManager', () => {
  test.beforeEach(async ({tabManager}) => {
    await tabManager.load();
    await tabManager.hydrated.waitFor();
  });

  test('should display tabs area', async ({tabManager}) => {
    await expect(tabManager.tabArea).toBeVisible();
  });

  test('should not display tabs dropdown', async ({tabManager}) => {
    await expect(tabManager.tabDropdown).toBeHidden();
  });

  test('should display tab buttons for each atomic-tab elements', async ({
    tabManager,
  }) => {
    await expect(tabManager.tabDropdown).toBeHidden();

    await expect(tabManager.tabButtons()).toHaveText([
      'All',
      'Articles',
      'Documentation',
    ]);
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
      await expect(tabManager.tabDropdown).toBeHidden();
    });

    test.describe('should change other component visibility', async () => {
      test.beforeEach(async ({facets}) => {
        await facets.getFacetValue.first().waitFor({state: 'visible'});
      });
      test.fixme('facets', async ({tabManager}) => {
        const includedFacets = await tabManager.includedFacet.all();
        for (let i = 0; i < includedFacets.length; i++) {
          await expect(includedFacets[i]).toBeHidden();
        }

        const excludedFacets = await tabManager.excludedFacet.all();
        for (let i = 0; i < excludedFacets.length; i++) {
          await expect(excludedFacets[i]).toBeVisible();
        }
      });

      test('smart snippet', async ({tabManager}) => {
        await expect(tabManager.smartSnippet).toBeHidden();
      });

      test('sort dropdown', async ({tabManager}) => {
        await tabManager.sortDropdown.waitFor({state: 'visible'});

        await expect(tabManager.sortDropdownOptions).toHaveText([
          'Name descending',
          'Name ascending',
          'Relevance',
        ]);
      });

      test('result list', async ({tabManager}) => {
        await expect(tabManager.excludedResultList).toBeVisible();
        await expect(tabManager.includedResultList).toBeHidden();
      });
    });

    test('should display tab buttons for each atomic-tab elements', async ({
      tabManager,
    }) => {
      await expect(tabManager.tabDropdown).toBeHidden();

      await expect(tabManager.tabButtons()).toHaveText([
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
          await tabManager.excludedFacet.last().waitFor({state: 'hidden'});
          const includedFacets = await tabManager.includedFacet.all();
          for (let i = 0; i < includedFacets.length; i++) {
            await expect(includedFacets[i]).toBeVisible();
          }

          const excludedFacets = await tabManager.excludedFacet.all();
          for (let i = 0; i < excludedFacets.length; i++) {
            await expect(excludedFacets[i]).toBeHidden();
          }
        });

        test('smart snippet', async ({tabManager}) => {
          await expect(tabManager.smartSnippet).toBeVisible();
        });

        test('sort dropdown', async ({tabManager}) => {
          await tabManager.sortDropdown.waitFor({state: 'visible'});

          await expect(tabManager.sortDropdownOptions).toHaveText([
            'Most Recent',
            'Least Recent',
            'Relevance',
          ]);
        });

        test('result list', async ({tabManager}) => {
          await expect(tabManager.includedResultList).toBeVisible();
          await expect(tabManager.excludedResultList).toBeHidden();
        });
      });

      test.describe('when selecting previous tab', () => {
        test.beforeEach(async ({tabManager, facets}) => {
          await tabManager.tabButtons('All').click();
          await facets.getFacetValue.first().waitFor({state: 'visible'});
        });

        test.describe('should change other component visibility', async () => {
          test.fixme('facets', async ({tabManager}) => {
            const excludedFacets = await tabManager.excludedFacet.all();
            for (let i = 0; i < excludedFacets.length; i++) {
              await expect(excludedFacets[i]).toBeVisible();
            }

            const includedFacets = await tabManager.includedFacet.all();
            for (let i = 0; i < includedFacets.length; i++) {
              await expect(includedFacets[i]).toBeHidden();
            }
          });

          test('smart snippet', async ({tabManager}) => {
            await expect(tabManager.smartSnippet).toBeHidden();
          });

          test('sort dropdown', async ({tabManager}) => {
            await tabManager.sortDropdown.waitFor({state: 'visible'});

            await expect(tabManager.sortDropdownOptions).toHaveText([
              'Name descending',
              'Name ascending',
              'Relevance',
            ]);
          });

          test('result list', async ({tabManager}) => {
            await expect(tabManager.excludedResultList).toBeVisible();
            await expect(tabManager.includedResultList).toBeHidden();
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
          await expect(tabManager.tabArea).toBeHidden();
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
      await expect(tabManager.tabArea).toBeHidden();
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
          await tabManager.refineModalButton.click();
          await tabManager.refineModalHeader.waitFor({state: 'visible'});

          const includedFacets = await tabManager.includedModalFacet.all();
          for (let i = 0; i < includedFacets.length; i++) {
            await expect(includedFacets[i]).toBeVisible();
          }

          const excludedFacets = await tabManager.excludedModalFacet.all();
          for (let i = 0; i < excludedFacets.length; i++) {
            await expect(excludedFacets[i]).toBeHidden();
          }
        });

        test('smart snippet', async ({tabManager}) => {
          await expect(tabManager.smartSnippet).not.toBeHidden();
        });

        test('sort dropdown', async ({tabManager}) => {
          await tabManager.refineModalButton.click();
          await tabManager.refineModalHeader.waitFor({state: 'visible'});

          await expect(tabManager.refineModalSortDropdownOptions).toHaveText([
            'Most Recent',
            'Least Recent',
            'Relevance',
          ]);
        });

        test('result list', async ({tabManager}) => {
          await expect(tabManager.includedResultList).toBeVisible();
          await expect(tabManager.excludedResultList).toBeHidden();
        });
      });

      test.describe('when selecting previous dropdown option', () => {
        test.beforeEach(async ({tabManager}) => {
          await tabManager.tabDropdown.selectOption('all');
        });

        test.describe('should change other component visibility', async () => {
          test('facets', async ({tabManager}) => {
            await tabManager.refineModalButton.click();
            await tabManager.refineModalHeader.waitFor({state: 'visible'});

            const excludedFacets = await tabManager.excludedModalFacet.all();
            for (let i = 0; i < excludedFacets.length; i++) {
              await expect(excludedFacets[i]).toBeVisible();
            }

            const includedFacets = await tabManager.includedModalFacet.all();
            for (let i = 0; i < includedFacets.length; i++) {
              await expect(includedFacets[i]).toBeHidden();
            }
          });

          test('smart snippet', async ({tabManager}) => {
            await expect(tabManager.smartSnippet).toBeHidden();
          });

          test('sort dropdown', async ({tabManager}) => {
            await tabManager.refineModalButton.click();
            await tabManager.refineModalHeader.waitFor({state: 'visible'});

            await expect(tabManager.refineModalSortDropdownOptions).toHaveText([
              'Name descending',
              'Name ascending',
              'Relevance',
            ]);
          });

          test('result list', async ({tabManager}) => {
            await expect(tabManager.excludedResultList).toBeVisible();
            await expect(tabManager.includedResultList).toBeHidden();
          });
        });
      });

      test.describe('when resizing viewport', () => {
        test.beforeEach(async ({page}) => {
          await page.setViewportSize({width: 1000, height: 500});
        });

        test('should hide tabs dropdown', async ({tabManager}) => {
          await expect(tabManager.tabDropdown).toBeHidden();
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
});
