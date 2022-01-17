import {configure} from '../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../page-objects/search';
import {ResultQuickviewExpectations as Expect} from './result-quickview-expectations';
import {ResultQuickviewActions as Actions} from './result-quickview-actions';
import {scope} from '../../reporters/detailed-collector';

interface ResultQuickviewOptions {
  result: object;
  maximumPreviewSize: number;
  previewButtonIcon: string;
  previewButtonLabel: string;
  previewButtonVariant: string;
}

function mockResultHtmlContent(html?: string) {
  cy.intercept('POST', '**/rest/search/v2/html?*', (req) => {
    req.continue((res) => {
      const div = document.createElement('div');
      div.innerText = html ? html : 'this is a response';
      res.headers = {contentType: 'text/html'};
      res.body = div;
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

describe('quantic-resultQuickview', () => {
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
      mockResultHtmlContent();
      scope('when loading the page', () => {
        Expect.events.receivedEvent(true, haspreview);
        Expect.displayButtonPreview(true);
        Expect.displaySectionPreview(false);
        Expect.buttonPreviewIsDisabled(false);
        Actions.clickPreview();
        Expect.displaySectionPreview(true);
        Expect.displayTitle(true);
        Expect.displayDate(true);
        Expect.logDocumentQuickview('Test');
      });

      scope('when the result has no html version', () => {
        const result = {
          hasHtmlVersion: false,
        };
        visitResultQuickview({
          result: result,
        });
        Expect.displayButtonPreview(true);
        Expect.buttonPreviewIsDisabled(true);
      });

      scope('when receiving a script in html content', () => {
        visitResultQuickview();
        mockResultHtmlContent('<script>alert("hello")</script>');

        Actions.clickPreview();
        Expect.displaySectionPreview(true);
        Expect.displayDate(true);
        Expect.displayTitle(true);
        Expect.displayContentContainer(false);
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
        mockResultHtmlContent();

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
        mockResultHtmlContent();

        Expect.displayButtonPreview(true);
        Expect.buttonPreviewContains('custom label');
        Actions.clickPreview();
        Expect.displaySectionPreview(true);
      });

      scope('custom #previewButtonVariant', () => {
        visitResultQuickview({
          previewButtonVariant: 'outline-brand',
        });
        mockResultHtmlContent();

        Expect.displayButtonPreview(true, 'outline-brand');
        Actions.clickPreview('outline-brand');
        Expect.displaySectionPreview(true);
      });
    });
  });
});
