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

        const quickviewContent = resultQuickview.quickviewContent;
        await expect(quickviewContent).toContainText(
          'dewalt 20v cordless drill'
        );
        await expect(resultQuickview.quickviewFooter).toBeVisible();
      });
    });

    test.describe('with a custom preview size defined', () => {
      test.use({
        options: {
          maximumPreviewSize: 420,
        },
      });

      test('should request the preview size on the api call', async ({
        resultQuickview,
        search,
      }) => {
        await search.mockQuickviewResponse(
          '<html><body><div>makita 20v cordless drill</div></body></html>'
        );
        const quickViewButton = resultQuickview.quickviewButton;
        const htmlResponsePromise = search.waitForQuickviewResponse();
        await quickViewButton.click();
        const response = await htmlResponsePromise;

        expect(response.url()).toContain('requestedOutputSize=420');
      });
    });
  });
});
