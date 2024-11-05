import {test, expect} from './fixture';

test.describe('AtomicTabManager', () => {
  test.beforeEach(async ({tabManager}) => {
    await tabManager.load();
    await tabManager.hydrated.waitFor();
  });

  test('should display tabs area', async ({tabManager}) => {
    await expect(tabManager.tabArea).toBeVisible();
  });

  test('should not display tabs popover menu button', async ({tabManager}) => {
    await expect(tabManager.tabPopoverMenuButton).toBeHidden();
  });

  test('should display tab buttons for each atomic-tab elements', async ({
    tabManager,
  }) => {
    await expect(tabManager.tabPopoverMenuButton).toBeHidden();

    await expect(tabManager.tabButtons()).toHaveText([
      'All',
      'Articles',
      'Documentation',
      'Parts and Accessories',
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

    test('should not display tabs popover menu button', async ({
      tabManager,
    }) => {
      await expect(tabManager.tabPopoverMenuButton).toBeHidden();
    });

    test.describe('should change other component visibility', async () => {
      test.beforeEach(async ({facets}) => {
        await facets.facetValue.first().waitFor({state: 'visible'});
      });
      test('facets', async ({tabManager}) => {
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
          'Relevance',
          'Name descending',
          'Name ascending',
        ]);
      });

      test('result list', async ({tabManager}) => {
        await expect(tabManager.excludedResultList).toBeVisible();
        await expect(tabManager.includedResultList).toBeHidden();
      });

      test('generated answer', async ({tabManager, searchBox}) => {
        await searchBox.searchInput.waitFor({state: 'visible'});
        await searchBox.searchInput.fill(
          // eslint-disable-next-line @cspell/spellchecker
          'how to resolve netflix connection with tivo'
        );
        await searchBox.searchInput.press('Enter');
        await expect(tabManager.generatedAnswer).toBeHidden();
      });
    });

    test('should display tab buttons for each atomic-tab elements', async ({
      tabManager,
    }) => {
      await expect(tabManager.tabPopoverMenuButton).toBeHidden();

      await expect(tabManager.tabButtons()).toHaveText([
        'All',
        'Articles',
        'Documentation',
        'Parts and Accessories',
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
            'Relevance',
            'Most Recent',
            'Least Recent',
          ]);
        });

        test('result list', async ({tabManager}) => {
          await expect(tabManager.includedResultList).toBeVisible();
          await expect(tabManager.excludedResultList).toBeHidden();
        });

        test('generated answer', async ({tabManager, searchBox}) => {
          await searchBox.searchInput.waitFor({state: 'visible'});
          await searchBox.searchInput.fill(
            // eslint-disable-next-line @cspell/spellchecker
            'how to resolve netflix connection with tivo'
          );
          await searchBox.searchInput.press('Enter');

          await tabManager.generatedAnswer.waitFor({state: 'visible'});
          await expect(tabManager.generatedAnswer).toBeVisible();
        });
      });

      test.describe('when selecting previous tab', () => {
        test.beforeEach(async ({tabManager, facets}) => {
          await tabManager.tabButtons('All').click();
          await facets.facetValue.first().waitFor({state: 'visible'});
        });

        test.describe('should change other component visibility', async () => {
          test('facets', async ({tabManager}) => {
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
              'Relevance',
              'Name descending',
              'Name ascending',
            ]);
          });

          test('result list', async ({tabManager}) => {
            await expect(tabManager.excludedResultList).toBeVisible();
            await expect(tabManager.includedResultList).toBeHidden();
          });

          test('generated answer', async ({tabManager, searchBox}) => {
            await searchBox.searchInput.waitFor({state: 'visible'});
            await searchBox.searchInput.fill(
              // eslint-disable-next-line @cspell/spellchecker
              'how to resolve netflix connection with tivo'
            );
            await searchBox.searchInput.press('Enter');
            await expect(tabManager.generatedAnswer).toBeHidden();
          });
        });
      });

      test.describe('when resizing viewport', () => {
        test.beforeEach(async ({page}) => {
          await page.setViewportSize({width: 300, height: 500});
        });

        test('should display tabs popover menu button', async ({
          tabManager,
        }) => {
          await expect(tabManager.tabPopoverMenuButton).toBeVisible();
        });

        test('should move overflowed tabs to popover tabs', async ({
          tabManager,
        }) => {
          await tabManager.tabPopoverMenuButton.click();
          await expect(tabManager.popoverTabs()).toHaveText([
            'All',
            'Documentation',
            'Parts and Accessories',
          ]);
        });

        test('should not have the active tab in the popover tabs', async ({
          tabManager,
        }) => {
          await tabManager.tabPopoverMenuButton.click();
          const popoverTabs = tabManager.popoverTabs();
          await expect(popoverTabs).toHaveCount(3);
          for (const tab of await popoverTabs.all()) {
            await expect(tab).not.toHaveText('Articles');
          }
          await expect(
            tabManager.tabButtons().locator('visible=true')
          ).toHaveText(['Articles']);
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

    test('should display tabs popover menu button', async ({tabManager}) => {
      await expect(tabManager.tabPopoverMenuButton).toBeVisible();
    });

    test('should move overflowed tabs to popover tabs', async ({
      tabManager,
    }) => {
      await tabManager.tabPopoverMenuButton.click();
      await expect(tabManager.popoverTabs()).toHaveText([
        'Articles',
        'Documentation',
        'Parts and Accessories',
      ]);
    });

    test.describe('when selecting a tab popover button', () => {
      test.beforeEach(async ({tabManager}) => {
        await tabManager.tabPopoverMenuButton.click();
        await tabManager.popoverTabs('Articles').click();
      });

      test('should change active tab', async ({tabManager}) => {
        await expect(tabManager.activeTab).toHaveText('Articles');
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
            'Relevance',
            'Most Recent',
            'Least Recent',
          ]);
        });

        test('result list', async ({tabManager}) => {
          await expect(tabManager.includedResultList).toBeVisible();
          await expect(tabManager.excludedResultList).toBeHidden();
        });

        test('generated answer', async ({tabManager, searchBox}) => {
          await searchBox.searchInput.waitFor({state: 'visible'});
          await searchBox.searchInput.fill(
            // eslint-disable-next-line @cspell/spellchecker
            'how to resolve netflix connection with tivo'
          );

          await searchBox.searchInput.press('Enter');

          await expect(tabManager.generatedAnswer).toBeVisible();
        });
      });

      test.describe('when selecting previous tab in popover buttons', () => {
        test.beforeEach(async ({tabManager}) => {
          await tabManager.tabPopoverMenuButton.click();
          await tabManager.popoverTabs('All').click();
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
              'Relevance',
              'Name descending',
              'Name ascending',
            ]);
          });

          test('result list', async ({tabManager}) => {
            await expect(tabManager.excludedResultList).toBeVisible();
            await expect(tabManager.includedResultList).toBeHidden();
          });

          test('generated answer', async ({tabManager, searchBox}) => {
            await searchBox.searchInput.waitFor({state: 'visible'});
            await searchBox.searchInput.fill(
              // eslint-disable-next-line @cspell/spellchecker
              'how to resolve netflix connection with tivo'
            );
            await searchBox.searchInput.press('Enter');
            await expect(tabManager.generatedAnswer).toBeHidden();
          });
        });
      });

      test.describe('when resizing viewport', () => {
        test.beforeEach(async ({page}) => {
          await page.setViewportSize({width: 1000, height: 500});
        });

        test('should hide tab popover menu button', async ({tabManager}) => {
          await expect(tabManager.tabPopoverMenuButton).toBeHidden();
        });

        test('should display tab buttons for each atomic-tab elements', async ({
          tabManager,
        }) => {
          await expect(tabManager.tabPopoverMenuButton).toBeHidden();

          await expect(tabManager.tabButtons()).toHaveText([
            'All',
            'Articles',
            'Documentation',
            'Parts and Accessories',
          ]);
        });
      });
    });
  });
});
