import {expect, test} from './fixture';

function mobileViewportSize() {
  return {
    width: parseInt('1024px'.slice(0, -2)) - 1,
    height: 1080,
  };
}

function desktopViewportSize() {
  return {
    width: parseInt('1024px'.slice(0, -2)) + 1,
    height: 1080,
  };
}

test.describe('Quickview', () => {
  test.describe('when displaying search results', () => {
    test.beforeEach(async ({quickview}) => {
      await quickview.load();
    });

    test('should render the quickview button', async ({quickview}) => {
      await expect(quickview.resultButton).toBeVisible();
    });
  });

  test.describe('when the quickview button is clicked', () => {
    test.beforeEach(async ({quickview}) => {
      await quickview.load({
        args: {
          sandbox:
            'allow-scripts allow-popups allow-top-navigation allow-same-origin',
        },
      });
      await quickview.hydrated.waitFor();
      await quickview.resultButton.click();
      await quickview.modal.waitFor({state: 'visible'});
    });

    test('should display the quickview modal', async ({quickview}) => {
      await expect(quickview.modal).toBeVisible();
    });

    test('should display a clickable link in the header', async ({
      quickview,
    }) => {
      await expect(quickview.header).toBeVisible();
      await expect(quickview.titleLink).toBeVisible();
      await expect(quickview.titleLink).toHaveAttribute('href', /.+/);
    });

    test('should display a pager navigation buttons', async ({quickview}) => {
      await expect(quickview.previousQuickviewButton).toBeVisible();
      await expect(quickview.nextQuickviewButton).toBeVisible();
    });

    test('should display a pagination summary', async ({quickview}) => {
      await expect(quickview.pagerSummary).toBeVisible();
    });

    test('should display a close button', async ({quickview}) => {
      await expect(quickview.closeButton).toBeVisible();
    });

    test.describe('when the close button is clicked', () => {
      test.beforeEach(async ({quickview}) => {
        await quickview.closeButton.click();
      });

      test('should close the modal', async ({quickview}) => {
        await expect(quickview.modal).not.toBeVisible();
      });
    });

    test('should display the keywords highlight', async ({quickview}) => {
      await expect(quickview.keywordsHighlight).toBeVisible();
    });

    test('should check the keywords highlight', async ({quickview}) => {
      await expect(quickview.keywordsHighlight).toBeChecked();
    });

    test('should navigate between keyword highlights', async ({quickview}) => {
      await expect(quickview.keywordNavigatorNext).not.toBeDisabled();
      await expect(quickview.keywordNavigatorPrevious).not.toBeDisabled();
    });

    test.describe('when a toggle sidebar keyword is clicked', () => {
      test.beforeEach(async ({quickview}) => {
        await quickview.keywordsHighlight.click();
      });

      test('should disable navigation buttons', async ({quickview}) => {
        await expect(quickview.keywordNavigatorNext).toBeDisabled();
        await expect(quickview.keywordNavigatorPrevious).toBeDisabled();
      });
    });

    test.describe('when the remove highlights button clicked', () => {
      test.beforeEach(async ({quickview}) => {
        await quickview.removeHighlights.click();
      });

      test('should disable navigation buttons', async ({quickview}) => {
        await expect(quickview.keywordNavigatorNext).toBeDisabled();
        await expect(quickview.keywordNavigatorPrevious).toBeDisabled();
      });
    });

    test.describe('when the toggle keyword navigation button is clicked', () => {
      test.beforeEach(async ({quickview}) => {
        await quickview.toggleKeywordNavigationButton.click();
      });

      test('should hide the keywords navigation', async ({quickview}) => {
        await expect(quickview.keywordsHighlight).not.toBeVisible();
      });
    });
  });

  test.describe('when used in desktop mode', () => {
    const {width, height} = desktopViewportSize();

    test.beforeEach(async ({quickview, page}) => {
      await quickview.load();
      await page.setViewportSize({width, height});
      await quickview.resultButton.click();
      await quickview.modal.waitFor({state: 'visible'});
    });

    test('should not open in full screen', async ({quickview}) => {
      const modalWidth = await quickview.modalContainer.evaluate(
        (modal) => modal.clientWidth
      );

      expect(modalWidth).toBeLessThan(width);
    });
  });

  test.describe('when used in mobile mode', () => {
    const {width, height} = mobileViewportSize();

    test.beforeEach(async ({quickview, page}) => {
      await quickview.load();
      await page.setViewportSize({width, height});
      await quickview.resultButton.click();
      await quickview.modal.waitFor({state: 'visible'});
    });

    test('should open in full screen', async ({quickview}) => {
      const modalWidth = await quickview.modalContainer.evaluate(
        (modal) => modal.clientWidth
      );

      expect(modalWidth).toBe(width);
    });
  });

  test.describe('when not used inside a result template', () => {
    test.beforeEach(async ({quickview}) => {
      await quickview.load({story: 'outside-result-template'});
    });

    test('should should not log error to console', async ({page}) => {
      const errorMessage = await page.waitForEvent('console', (msg) => {
        return msg.type() === 'error';
      });

      const matcher = expect(errorMessage.text());

      matcher.toContain(
        'Result component is in error and has been removed from the DOM'
      );
    });
  });
});
