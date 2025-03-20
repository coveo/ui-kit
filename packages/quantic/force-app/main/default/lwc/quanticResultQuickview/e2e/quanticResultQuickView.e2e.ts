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
          '<html><body><div>HTML content</div></body></html>'
        );

        const quickViewButton = resultQuickview.button;
        await quickViewButton.scrollIntoViewIfNeeded();

        await expect(quickViewButton).toBeVisible();
        await expect(quickViewButton).not.toBeDisabled();
        await expect(await resultQuickview.receivedEvents()).toContain(
          'quantic__haspreview'
        );

        const htmlResponsePromise = search.waitForQuickviewResponse();
        await resultQuickview.clickQuickviewButton();
        await htmlResponsePromise;

        const contentContainer = resultQuickview.modalContent;
        await expect(contentContainer).toBeVisible();
        const iframe = contentContainer.locator('iframe');
        const iframeContent = await iframe.contentFrame();
        await expect(iframeContent?.locator('div')).toContainText(
          'HTML content'
        );
      });
    });

    test.describe('when result has no html version', () => {
      test.use({
        options: {
          result: JSON.stringify({hasHtmlVersion: false}),
        },
      });

      test('should disable quickview button', async ({resultQuickview}) => {
        const previewButton = resultQuickview.button;
        await expect(previewButton).toBeVisible();
        await expect(previewButton).toBeDisabled();
      });
    });

    test.describe('with custom preview button icon', () => {
      const customIcon = 'utility:bug';
      test.use({
        options: {
          previewButtonIcon: customIcon,
        },
      });

      test('should display proper icon', async ({resultQuickview}) => {
        const previewButton = resultQuickview.button;
        await expect(previewButton).toBeVisible();

        const buttonIcon = resultQuickview.buttonIcon;
        await expect(buttonIcon).toBeVisible();
        await expect(buttonIcon).toHaveAttribute('icon-name', customIcon);
      });
    });

    test.describe('with custom label', () => {
      const customLabel = 'patate douce';
      test.use({
        options: {
          previewButtonLabel: customLabel,
        },
      });

      test('should display the label', async ({resultQuickview}) => {
        const label = resultQuickview.button;
        await expect(label).toContainText(customLabel);
      });
    });

    test.describe('with custom tooltip', () => {
      const customTooltip = 'poilievre';
      test.use({
        options: {
          tooltip: customTooltip,
        },
      });

      test('should display custom tooltip', async ({resultQuickview}) => {
        const tooltip = resultQuickview.buttonTooltip;
        await expect(tooltip).toContainText(customTooltip);
      });
    });

    test.describe('with custom button variant', () => {
      const variants = ['brand', 'outline-brand', 'result-action'];
      variants.forEach((variant) => {
        test.describe(`with variant ${variant}`, () => {
          test.use({
            options: {
              previewButtonVariant: variant,
            },
          });

          test('should display preview button with variant class', async ({
            resultQuickview,
          }) => {
            if (variant === 'result-action') {
              await expect(resultQuickview.button.locator('..')).toHaveClass(
                new RegExp(variant)
              );
              await expect(await resultQuickview.receivedEvents()).toContain(
                'quantic__resultactionregister'
              );
            } else {
              await expect(resultQuickview.button).toHaveClass(
                new RegExp(variant)
              );
              await expect(
                await resultQuickview.receivedEvents()
              ).not.toContain('quantic__resultactionregister');
            }
          });
        });
      });
    });
  });
});
