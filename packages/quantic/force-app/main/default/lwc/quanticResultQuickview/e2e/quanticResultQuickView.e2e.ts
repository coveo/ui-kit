import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch as typeof testSearch,
  insight: testInsight as typeof testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic result quickview ${useCase.label}`, () => {
    test.describe('when clicked', () => {
      test('should open container with content', async ({
        resultQuickview,
        search,
      }) => {
        await search.mockQuickviewResponse(
          '<html><body><div>dewalt 20v cordless drill</div></body></html>'
        );

        const quickViewButton = resultQuickview.quickviewButton;
        await quickViewButton.scrollIntoViewIfNeeded();

        await expect(quickViewButton).toBeVisible();
        await expect(quickViewButton).not.toBeDisabled();
        await expect(await resultQuickview.receivedEvents()).toContain(
          'quantic__haspreview'
        );

        const htmlResponsePromise = search.waitForQuickviewResponse();
        const uaRequest = resultQuickview.waitForQuickviewClickEvent();
        await quickViewButton.click();
        await htmlResponsePromise;
        await uaRequest;

        const contentContainer = resultQuickview.quickviewContent;
        await expect(contentContainer).toBeVisible();
        const iframe = contentContainer.locator('iframe');
        const iframeContent = await iframe.contentFrame();
        await expect(iframeContent?.locator('div')).toContainText(
          'dewalt 20v cordless drill'
        );
      });
    });
  });
});
