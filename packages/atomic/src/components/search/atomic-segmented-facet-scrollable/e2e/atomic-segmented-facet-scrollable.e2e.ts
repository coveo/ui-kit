import {expect, test} from './fixture';

test.describe('atomic-segmented-facet-scrollable', () => {
  test.beforeEach(async ({segmentedFacetScrollable}) => {
    await segmentedFacetScrollable.load();
  });

  test('it loads properly', async ({segmentedFacetScrollable}) => {
    await expect(segmentedFacetScrollable.hydrated).toBeVisible();
  });

  test('should display scrollable container and scroll elements', async ({
    segmentedFacetScrollable,
  }) => {
    await expect(segmentedFacetScrollable.hydrated).toBeVisible();
    await expect(segmentedFacetScrollable.scrollableContainer).toBeVisible();
    await expect(segmentedFacetScrollable.horizontalScroll).toBeVisible();
  });

  test('should display fade elements and arrow icons in DOM', async ({
    segmentedFacetScrollable,
  }) => {
    await expect(segmentedFacetScrollable.leftFade).toBeAttached();
    await expect(segmentedFacetScrollable.rightFade).toBeAttached();
    await expect(segmentedFacetScrollable.leftArrowIcon).toBeAttached();
    await expect(segmentedFacetScrollable.rightArrowIcon).toBeAttached();
  });

  test('should hide both arrows when content is not scrollable', async ({
    segmentedFacetScrollable,
  }) => {
    await segmentedFacetScrollable.page.waitForTimeout(2000);

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

  test('should show right arrow when content overflows at start position', async ({
    segmentedFacetScrollable,
  }) => {
    await segmentedFacetScrollable.page.waitForTimeout(2000);

    const isScrollable = await segmentedFacetScrollable.isScrollable();

    if (isScrollable) {
      const scrollPosition = await segmentedFacetScrollable.getScrollPosition();
      expect(scrollPosition).toBe(0);

      await expect(segmentedFacetScrollable.rightArrowWrapper).not.toHaveClass(
        /invisible/
      );
      await expect(segmentedFacetScrollable.leftArrowWrapper).toHaveClass(
        /invisible/
      );
    } else {
      await expect(segmentedFacetScrollable.leftArrowWrapper).toHaveClass(
        /invisible/
      );
      await expect(segmentedFacetScrollable.rightArrowWrapper).toHaveClass(
        /invisible/
      );
    }
  });

  test('should scroll right when right arrow is clicked', async ({
    segmentedFacetScrollable,
  }) => {
    await segmentedFacetScrollable.page.waitForTimeout(2000);

    const isScrollable = await segmentedFacetScrollable.isScrollable();

    if (isScrollable) {
      const initialPosition =
        await segmentedFacetScrollable.getScrollPosition();
      await segmentedFacetScrollable.clickRightArrow();
      await segmentedFacetScrollable.page.waitForTimeout(300);

      const newPosition = await segmentedFacetScrollable.getScrollPosition();
      expect(newPosition).toBeGreaterThan(initialPosition);
    }
  });

  test('should show left arrow after scrolling right', async ({
    segmentedFacetScrollable,
  }) => {
    await segmentedFacetScrollable.page.waitForTimeout(2000);

    const isScrollable = await segmentedFacetScrollable.isScrollable();

    if (isScrollable) {
      await segmentedFacetScrollable.clickRightArrow();
      await segmentedFacetScrollable.page.waitForTimeout(300);

      await expect(segmentedFacetScrollable.leftArrowWrapper).not.toHaveClass(
        /invisible/
      );
    }
  });

  test('should scroll left when left arrow is clicked', async ({
    segmentedFacetScrollable,
  }) => {
    await segmentedFacetScrollable.page.waitForTimeout(2000);

    const isScrollable = await segmentedFacetScrollable.isScrollable();

    if (isScrollable) {
      await segmentedFacetScrollable.clickRightArrow();
      await segmentedFacetScrollable.page.waitForTimeout(300);

      const beforeLeftClick =
        await segmentedFacetScrollable.getScrollPosition();
      await segmentedFacetScrollable.clickLeftArrow();
      await segmentedFacetScrollable.page.waitForTimeout(300);

      const afterLeftClick = await segmentedFacetScrollable.getScrollPosition();
      expect(afterLeftClick).toBeLessThan(beforeLeftClick);
    }
  });
});
