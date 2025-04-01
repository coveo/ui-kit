import {configure} from '../../../page-objects/configurator';
import {
  interceptSearch,
  mockResultHtmlContent,
} from '../../../page-objects/search';
import {scope} from '../../../reporters/detailed-collector';
import {ResultQuickviewActions as Actions} from './result-quickview-actions';
import {
  ResultQuickviewExpectations as Expect,
  PreviewVariantType,
} from './result-quickview-expectations';

const variants = ['brand', 'outline-brand', 'result-action'];

interface ResultQuickviewOptions {
  result: string;
  maximumPreviewSize: number;
  previewButtonIcon: string;
  previewButtonLabel: string;
  previewButtonVariant: PreviewVariantType;
  tooltip: string;
}

describe('quantic-result-quickview', () => {
  const pageUrl = 's/quantic-result-quickview';

  const haspreview = 'quantic__haspreview';
  const resultActionRegister = 'quantic__resultactionregister';

  function visitResultQuickview(options: Partial<ResultQuickviewOptions> = {}) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
  }

  describe('with default options', () => {
    it('should work as expected', () => {
      visitResultQuickview();
      mockResultHtmlContent('div');
      scope('when loading the page', () => {
        Expect.events.receivedEvent(true, haspreview);
        Expect.displayButtonPreview(true);
        Expect.displaySectionPreview(false);
        Expect.buttonPreviewIsDisabled(false);
        Actions.clickPreview();
        Expect.displaySectionPreview(true);
        Expect.displayTitle(true);
        Expect.displayDate(true);
        Expect.displayContentContainer(true);
        Expect.displaySpinner(true);
        Expect.logDocumentQuickview('Test');
      });

      scope('when the result has no html version', () => {
        const result = {
          hasHtmlVersion: false,
        };
        visitResultQuickview({
          result: JSON.stringify(result),
        });
        Expect.displayButtonPreview(true);
        Expect.buttonPreviewIsDisabled(true);
      });

      scope('when receiving a script in html content', () => {
        visitResultQuickview();
        mockResultHtmlContent(
          'html',
          '<body onload="myFunction()"><script>function myFunction() {alert("I am an alert box!");}</script> </body></html>'
        );

        Actions.clickPreview();
        Expect.logDocumentQuickview('Test');
        Expect.displaySectionPreview(true);
        Expect.displayDate(true);
        Expect.displayTitle(true);
        Expect.noAlertShown();
      });
    });
  });

  describe('with custom options', () => {
    it('should work as expected', () => {
      scope('custom #previewButtonIcon', () => {
        visitResultQuickview({
          previewButtonIcon: 'utility:bug',
        });
        mockResultHtmlContent('div');

        Expect.displayButtonPreview(true);
        Expect.displayButtonPreviewIcon(true);
        Expect.buttonPreviewIconContains('bug');
        Actions.clickPreview();
        Expect.displaySectionPreview(true);
      });

      scope('custom #previewButtonLabel', () => {
        visitResultQuickview({
          previewButtonLabel: 'custom label',
        });
        mockResultHtmlContent('div');

        Expect.displayButtonPreview(true);
        Expect.buttonPreviewContains('custom label');
        Actions.clickPreview();
        Expect.displaySectionPreview(true);
      });

      scope('custom #tooltip', () => {
        const customTooltip = 'Quick view';
        visitResultQuickview({
          tooltip: customTooltip,
        });
        mockResultHtmlContent('div');

        Expect.displayButtonPreview(true);
        Actions.hoverOverPreview();
        Expect.displayTooltip(customTooltip);
      });
    });
  });

  describe('the preview button with custom variants', () => {
    variants.forEach((variantValue) => {
      it(`should display the quick view button in the ${variantValue} variant`, () => {
        visitResultQuickview({
          previewButtonVariant: <PreviewVariantType>variantValue,
        });
        mockResultHtmlContent('div');

        scope('when loading the page', () => {
          if (variantValue === 'result-action') {
            Expect.events.receivedEvent(true, resultActionRegister);
          }
          Expect.displayButtonPreview(true);
          Expect.displayCorrectPreviewButtonVariant(
            <PreviewVariantType>variantValue
          );
        });
      });
    });
  });
});
