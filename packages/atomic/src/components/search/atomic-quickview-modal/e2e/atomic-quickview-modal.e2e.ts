import {expect, test} from './fixture';

test.describe('AtomicQuickviewModal', () => {
  test.describe('when modal is open', () => {
    test.beforeEach(async ({quickviewModal}) => {
      await quickviewModal.load({story: 'open-modal'});
      await quickviewModal.hydrated.waitFor();
    });

    test('should display the modal container', async ({quickviewModal}) => {
      await expect(quickviewModal.modal).toBeVisible();
    });

    test('should display the header with title link', async ({
      quickviewModal,
    }) => {
      await expect(quickviewModal.header).toBeVisible();
      await expect(quickviewModal.titleLink).toBeVisible();
    });

    test('should display the close button', async ({quickviewModal}) => {
      await expect(quickviewModal.closeButton).toBeVisible();
      await expect(quickviewModal.closeButton).toBeEnabled();
    });

    test('should display the body with sidebar and iframe container', async ({
      quickviewModal,
    }) => {
      await expect(quickviewModal.body).toBeVisible();
      await expect(quickviewModal.sidebar).toBeVisible();
      await expect(quickviewModal.iframeContainer).toBeVisible();
    });

    test('should display the footer with navigation buttons', async ({
      quickviewModal,
    }) => {
      await expect(quickviewModal.footer).toBeVisible();
      await expect(quickviewModal.previousButton).toBeVisible();
      await expect(quickviewModal.nextButton).toBeVisible();
    });

    test('should disable previous button on first result', async ({
      quickviewModal,
    }) => {
      await expect(quickviewModal.previousButton).toBeDisabled();
      await expect(quickviewModal.nextButton).toBeEnabled();
    });

    test('should display result position in pager text', async ({
      quickviewModal,
    }) => {
      await expect(quickviewModal.pagerText).toContainText('1');
      await expect(quickviewModal.pagerText).toContainText('10');
    });
  });

  test.describe('when on last result', () => {
    test.beforeEach(async ({quickviewModal}) => {
      await quickviewModal.load({story: 'last-result'});
      await quickviewModal.hydrated.waitFor();
    });

    test('should disable next button on last result', async ({
      quickviewModal,
    }) => {
      await expect(quickviewModal.previousButton).toBeEnabled();
      await expect(quickviewModal.nextButton).toBeDisabled();
    });
  });

  test.describe('when in middle of results', () => {
    test.beforeEach(async ({quickviewModal}) => {
      await quickviewModal.load({story: 'middle-of-results'});
      await quickviewModal.hydrated.waitFor();
    });

    test('should enable both navigation buttons', async ({quickviewModal}) => {
      await expect(quickviewModal.previousButton).toBeEnabled();
      await expect(quickviewModal.nextButton).toBeEnabled();
    });

    test('should display correct position in pager', async ({
      quickviewModal,
    }) => {
      await expect(quickviewModal.pagerText).toContainText('5');
      await expect(quickviewModal.pagerText).toContainText('10');
    });
  });

  test.describe('when modal is closed', () => {
    test.beforeEach(async ({quickviewModal}) => {
      await quickviewModal.load({story: 'closed'});
      await quickviewModal.hydrated.waitFor();
    });

    test('should not display the modal container', async ({quickviewModal}) => {
      await expect(quickviewModal.modalContainer).not.toBeVisible();
    });
  });
});
