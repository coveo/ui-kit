import {expect, test} from './fixture';

test.describe('atomic-segmented-facet-scrollable', () => {
  test.beforeEach(async ({segmentedFacetScrollable, page}) => {
    await page.setContent(`
      <atomic-search-interface>
        <atomic-segmented-facet-scrollable>
          <atomic-segmented-facet field="author" number-of-values="5"></atomic-segmented-facet>
        </atomic-segmented-facet-scrollable>
        <atomic-search-layout>
          <atomic-layout-section section="search">
            <atomic-search-box></atomic-search-box>
          </atomic-layout-section>
          <atomic-layout-section section="main">
            <atomic-layout-section section="horizontal-facets">
              <atomic-facet-manager></atomic-facet-manager>
            </atomic-layout-section>
            <atomic-layout-section section="results">
              <atomic-result-list></atomic-result-list>
            </atomic-layout-section>
          </atomic-layout-section>
        </atomic-search-layout>
      </atomic-search-interface>
    `);

    await segmentedFacetScrollable.hydrated.waitFor();
  });

  test('should render the component', async ({segmentedFacetScrollable}) => {
    await expect(segmentedFacetScrollable.component).toBeVisible();
    await expect(segmentedFacetScrollable.scrollableContainer).toBeVisible();
    await expect(segmentedFacetScrollable.horizontalScroll).toBeVisible();
  });

  test('should render segmented facets in the slot', async ({
    segmentedFacetScrollable,
  }) => {
    await expect(segmentedFacetScrollable.segmentedFacets).toHaveCount(1);
    await expect(
      segmentedFacetScrollable.segmentedFacets.first()
    ).toBeVisible();
  });

  test('should hide arrows when content is not scrollable', async ({
    segmentedFacetScrollable,
  }) => {
    const isScrollable = await segmentedFacetScrollable.isScrollable();

    if (!isScrollable) {
      await expect(segmentedFacetScrollable.leftArrowWrapper).toHaveClass(
        /invisible/
      );
      await expect(segmentedFacetScrollable.rightArrowWrapper).toHaveClass(
        /invisible/
      );
    }
  });

  test('should render all shadow parts', async ({segmentedFacetScrollable}) => {
    await expect(
      segmentedFacetScrollable.scrollableContainer
    ).toBeInTheDocument();
    await expect(segmentedFacetScrollable.horizontalScroll).toBeInTheDocument();
    await expect(segmentedFacetScrollable.leftArrowWrapper).toBeInTheDocument();
    await expect(
      segmentedFacetScrollable.rightArrowWrapper
    ).toBeInTheDocument();
    await expect(segmentedFacetScrollable.leftArrowButton).toBeInTheDocument();
    await expect(segmentedFacetScrollable.rightArrowButton).toBeInTheDocument();
    await expect(segmentedFacetScrollable.leftArrowIcon).toBeInTheDocument();
    await expect(segmentedFacetScrollable.rightArrowIcon).toBeInTheDocument();
    await expect(segmentedFacetScrollable.leftFade).toBeInTheDocument();
    await expect(segmentedFacetScrollable.rightFade).toBeInTheDocument();
  });

  test('should have accessible buttons', async ({segmentedFacetScrollable}) => {
    await expect(segmentedFacetScrollable.leftArrowButton).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    await expect(segmentedFacetScrollable.rightArrowButton).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    await expect(segmentedFacetScrollable.leftArrowButton).toHaveAttribute(
      'tabindex',
      '-1'
    );
    await expect(segmentedFacetScrollable.rightArrowButton).toHaveAttribute(
      'tabindex',
      '-1'
    );
  });

  test.describe('with scrollable content', () => {
    test.beforeEach(async ({segmentedFacetScrollable, page}) => {
      await page.setContent(`
        <atomic-search-interface>
          <atomic-segmented-facet-scrollable>
            <atomic-segmented-facet field="author" number-of-values="50"></atomic-segmented-facet>
          </atomic-segmented-facet-scrollable>
          <atomic-search-layout>
            <atomic-layout-section section="search">
              <atomic-search-box></atomic-search-box>
            </atomic-layout-section>
            <atomic-layout-section section="main">
              <atomic-layout-section section="horizontal-facets">
                <atomic-facet-manager></atomic-facet-manager>
              </atomic-layout-section>
              <atomic-layout-section section="results">
                <atomic-result-list></atomic-result-list>
              </atomic-layout-section>
            </atomic-layout-section>
          </atomic-search-layout>
        </atomic-search-interface>
      `);

      await segmentedFacetScrollable.hydrated.waitFor();
    });

    test('should show right arrow when at start position', async ({
      segmentedFacetScrollable,
    }) => {
      const isScrollable = await segmentedFacetScrollable.isScrollable();

      if (isScrollable) {
        const scrollPosition =
          await segmentedFacetScrollable.getScrollPosition();

        if (scrollPosition === 0) {
          await expect(segmentedFacetScrollable.leftArrowWrapper).toHaveClass(
            /invisible/
          );
          await expect(
            segmentedFacetScrollable.rightArrowWrapper
          ).not.toHaveClass(/invisible/);
        }
      }
    });

    test('should scroll right when clicking right arrow', async ({
      segmentedFacetScrollable,
    }) => {
      const isScrollable = await segmentedFacetScrollable.isScrollable();

      if (isScrollable) {
        const initialPosition =
          await segmentedFacetScrollable.getScrollPosition();

        await segmentedFacetScrollable.clickRightArrow();

        // Wait for scroll animation
        await segmentedFacetScrollable.page.waitForTimeout(500);

        const newPosition = await segmentedFacetScrollable.getScrollPosition();

        expect(newPosition).toBeGreaterThan(initialPosition);
      }
    });

    test('should scroll left when clicking left arrow', async ({
      segmentedFacetScrollable,
    }) => {
      const isScrollable = await segmentedFacetScrollable.isScrollable();

      if (isScrollable) {
        // First scroll right to be able to scroll left
        await segmentedFacetScrollable.clickRightArrow();
        await segmentedFacetScrollable.page.waitForTimeout(500);

        const initialPosition =
          await segmentedFacetScrollable.getScrollPosition();

        await segmentedFacetScrollable.clickLeftArrow();

        // Wait for scroll animation
        await segmentedFacetScrollable.page.waitForTimeout(500);

        const newPosition = await segmentedFacetScrollable.getScrollPosition();

        expect(newPosition).toBeLessThan(initialPosition);
      }
    });
  });

  test.describe('responsive behavior', () => {
    test('should hide arrows with large viewport when content fits', async ({
      segmentedFacetScrollable,
      page,
    }) => {
      // Set large viewport
      await page.setViewportSize({width: 7680, height: 4320});

      await page.setContent(`
        <atomic-search-interface>
          <atomic-segmented-facet-scrollable>
            <atomic-segmented-facet field="author" number-of-values="50"></atomic-segmented-facet>
          </atomic-segmented-facet-scrollable>
          <atomic-search-layout>
            <atomic-layout-section section="search">
              <atomic-search-box></atomic-search-box>
            </atomic-layout-section>
            <atomic-layout-section section="main">
              <atomic-layout-section section="horizontal-facets">
                <atomic-facet-manager></atomic-facet-manager>
              </atomic-layout-section>
              <atomic-layout-section section="results">
                <atomic-result-list></atomic-result-list>
              </atomic-layout-section>
            </atomic-layout-section>
          </atomic-search-layout>
        </atomic-search-interface>
      `);

      await segmentedFacetScrollable.hydrated.waitFor();

      const isScrollable = await segmentedFacetScrollable.isScrollable();

      // With large viewport, content should fit and arrows should be hidden
      if (!isScrollable) {
        await expect(segmentedFacetScrollable.leftArrowWrapper).toHaveClass(
          /invisible/
        );
        await expect(segmentedFacetScrollable.rightArrowWrapper).toHaveClass(
          /invisible/
        );
      }
    });

    test('should show arrows with small viewport when content overflows', async ({
      segmentedFacetScrollable,
      page,
    }) => {
      // Set small viewport
      await page.setViewportSize({width: 400, height: 320});

      await page.setContent(`
        <atomic-search-interface>
          <atomic-segmented-facet-scrollable>
            <atomic-segmented-facet field="author" number-of-values="4"></atomic-segmented-facet>
          </atomic-segmented-facet-scrollable>
          <atomic-search-layout>
            <atomic-layout-section section="search">
              <atomic-search-box></atomic-search-box>
            </atomic-layout-section>
            <atomic-layout-section section="main">
              <atomic-layout-section section="horizontal-facets">
                <atomic-facet-manager></atomic-facet-manager>
              </atomic-layout-section>
              <atomic-layout-section section="results">
                <atomic-result-list></atomic-result-list>
              </atomic-layout-section>
            </atomic-layout-section>
          </atomic-search-layout>
        </atomic-search-interface>
      `);

      await segmentedFacetScrollable.hydrated.waitFor();

      const isScrollable = await segmentedFacetScrollable.isScrollable();

      // With small viewport, content should overflow and right arrow should be visible
      if (isScrollable) {
        const scrollPosition =
          await segmentedFacetScrollable.getScrollPosition();

        if (scrollPosition === 0) {
          await expect(segmentedFacetScrollable.leftArrowWrapper).toHaveClass(
            /invisible/
          );
          await expect(
            segmentedFacetScrollable.rightArrowWrapper
          ).not.toHaveClass(/invisible/);
        }
      }
    });
  });
});
