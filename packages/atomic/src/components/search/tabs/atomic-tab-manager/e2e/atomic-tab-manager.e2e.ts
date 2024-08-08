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
    await expect(tabManager.tabDropdown).not.toBeVisible();
  });

  test('should display tab buttons for each atomic-tab elements', async ({
    tabManager,
  }) => {
    await expect(tabManager.tabDropdown).not.toBeVisible();

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
      await expect(tabManager.tabDropdown).not.toBeVisible();
    });

    test.describe('should change other component visibility', async () => {
      test.beforeEach(async ({facets}) => {
        await facets.getFacetValue.first().waitFor({state: 'visible'});
      });
      test('facets', async ({tabManager}) => {
        const includedFacets = await tabManager.includedFacet.all();
        for (let i = 0; i < includedFacets.length; i++) {
          await expect(includedFacets[i]).not.toBeVisible();
        }

        const excludedFacets = await tabManager.excludedFacet.all();
        for (let i = 0; i < excludedFacets.length; i++) {
          await expect(excludedFacets[i]).toBeVisible();
        }
      });
      test('smart snippet', async ({tabManager}) => {
        await expect(tabManager.smartSnippet).not.toBeVisible();
      });
      
      test('sort dropdown', async ({tabManager}) => {
        await tabManager.sortDropdown.waitFor({state: 'visible'});
        const expectedOptions = ['Most Recent', 'Least Recent', 'Relevance'];
        const options = await tabManager.sortDropdownOptions.allTextContents();
        expect(options).toEqual(expectedOptions);
      });
    });

      test('should display tab buttons for each atomic-tab elements', async ({
        tabManager,
      }) => {
        await expect(tabManager.tabDropdown).not.toBeVisible();

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
              await expect(excludedFacets[i]).not.toBeVisible();
            }
          });
          test('smart snippet', async ({tabManager}) => {
            await expect(tabManager.smartSnippet).toBeVisible();
          });
        });

        test.describe('when selecting previous tab', () => {
          test.beforeEach(async ({tabManager, facets}) => {
            await tabManager.tabButtons('All').click();
            await facets.getFacetValue.first().waitFor({state: 'visible'});
          });

          test.describe('should change other component visibility', async () => {
            test('facets', async ({tabManager}) => {
              const excludedFacets = await tabManager.excludedFacet.all();
              for (let i = 0; i < excludedFacets.length; i++) {
                await expect(excludedFacets[i]).toBeVisible();
              }

              const includedFacets = await tabManager.includedFacet.all();
              for (let i = 0; i < includedFacets.length; i++) {
                await expect(includedFacets[i]).not.toBeVisible();
              }
            });
          });
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
            await expect(tabManager.tabDropdown).toHaveValue('article');
          });
        });
      });
    });
  });

  test.describe('when viewport is too small to display all buttons', () => {
    test.beforeEach(async ({page}) => {
      await page.setViewportSize({width: 300, height: 1000});
    });

  test.describe('when selecting a dropdown option', () => {
    test.beforeEach(async ({tabManager}) => {
      await tabManager.tabDropdown.selectOption('article');
      await tabManager.sortDropdown.waitFor({state: 'visible'});
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
      test.beforeEach(async ({tabManager, facets}) => {
        await tabManager.tabDropdown.selectOption('article');
        await facets.getFacetValue.first().waitFor({state: 'visible'});
      });
      
      test('smart snippet', async ({tabManager}) => {
        await expect(tabManager.smartSnippet).toBeVisible();
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
      test.beforeEach(async ({tabManager}) => {
        await tabManager.tabDropdown.selectOption('all');
        await tabManager.sortDropdown.waitFor({state: 'visible'});
      })

      test('should change active tab', async ({tabManager}) => {
        await expect(tabManager.tabDropdown).toHaveValue('article');
      });

      test.describe('should change other component visibility', async () => {
        test('facets', async ({tabManager}) => {
          const includedFacets = await tabManager.includedFacet.all();
          for (let i = 0; i < includedFacets.length; i++) {
            await expect(includedFacets[i]).toBeVisible();
          }

          const excludedFacets = await tabManager.excludedFacet.all();
          for (let i = 0; i < excludedFacets.length; i++) {
            await expect(excludedFacets[i]).not.toBeVisible();
          }
        });
        test('smart snippet', async ({tabManager}) => {
          await expect(tabManager.smartSnippet).toBeVisible();
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

    test.describe('when resizing viewport', () => {
      test.beforeEach(async ({page, tabManager}) => {
        await page.setViewportSize({width: 1000, height: 500});
        await tabManager.tabArea.waitFor({state: 'visible'});
      });
      
      test.describe('when selecting previous dropdown option', () => {
        test.beforeEach(async ({tabManager, facets}) => {
          await tabManager.tabDropdown.selectOption('all');
          await facets.getFacetValue.first().waitFor({state: 'visible'});
        });

        test.describe('should change other component visibility', async () => {
          test('facets', async ({tabManager}) => {
            const excludedFacets = await tabManager.excludedFacet.all();
            for (let i = 0; i < excludedFacets.length; i++) {
              await expect(excludedFacets[i]).toBeVisible();
            }

            const includedFacets = await tabManager.includedFacet.all();
            for (let i = 0; i < includedFacets.length; i++) {
              await expect(includedFacets[i]).not.toBeVisible();
            }
          });
          test('smart snippet', async ({tabManager}) => {
            await expect(tabManager.smartSnippet).not.toBeVisible();
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
});
