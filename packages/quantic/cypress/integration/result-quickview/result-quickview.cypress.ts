import {configure} from '../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../page-objects/search';
import {ResultQuickviewExpectations as Expect} from './result-quickview-expectations';
import {ResultQuickviewActions as Actions} from './result-quickview-actions';
import {scope} from '../../reporters/detailed-collector';

interface ResultQuickviewOptions {
  result: string;
  maximumPreviewSize: number;
  previewButtonIcon: string;
  previewButtonLabel: string;
  previewButtonVariant: string;
}

function mockResultHtmlContent(tag: string, innerHtml?: string) {
  cy.intercept('POST', '**/rest/search/v2/html?*', (req) => {
    req.continue((res) => {
      const element = document.createElement(tag);
      element.innerHTML = innerHtml ? innerHtml : 'this is a response';
      res.body = element;
      res.send();
    });
  });
}

describe('quantic-result-quickview', () => {
  const pageUrl = 's/quantic-result-quickview';

  const haspreview = 'haspreview';

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
        Expect.displaySectionPreview(true);
        Expect.displayDate(true);
        Expect.displayTitle(true);
        Expect.displaySpinner(true);
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
    });
  });
});
