import {configure} from '../../../page-objects/configurator';
import {
  interceptSearch,
  mockResultHtmlContent,
} from '../../../page-objects/search';
import {scope} from '../../../reporters/detailed-collector';
import {ResultQuickviewActions as Actions} from './result-quickview-actions';
import {ResultQuickviewExpectations as Expect} from './result-quickview-expectations';

interface ResultQuickviewOptions {
  result: string;
  maximumPreviewSize: number;
  previewButtonIcon: string;
  previewButtonLabel: string;
  previewButtonVariant: string;
  tooltip: string;
}

describe('quantic-result-quickview', () => {
  const pageUrl = 's/quantic-result-quickview';

  const haspreview = 'haspreview';
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
        Expect.displaySpinner(false);
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

      scope('custom #previewButtonVariant', () => {
        visitResultQuickview({
          previewButtonVariant: 'outline-brand',
        });
        mockResultHtmlContent('div');

        Expect.displayButtonPreview(true, 'outline-brand');
        Actions.clickPreview('outline-brand');
        Expect.displaySectionPreview(true);
      });

      scope('custom #tooltip', () => {
        const customTooltip = 'Quick view';
        visitResultQuickview({
          tooltip: customTooltip,
        });
        mockResultHtmlContent('div');

        Expect.displayButtonPreview(true);
        Expect.displayTooltip(customTooltip);
      });
    });
  });

  describe('with #previewButtonVariant set to result-action', () => {
    it('should display the quickview button as a result action', () => {
      visitResultQuickview({
        previewButtonVariant: 'result-action',
      });
      mockResultHtmlContent('div');

      scope('when loading the page', () => {
        Expect.events.receivedEvent(true, resultActionRegister);
        Expect.displayButtonPreview(true, 'icon-border-filled');
      });
    });
  });
});
