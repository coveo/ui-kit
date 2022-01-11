import {configure} from '../../page-objects/configurator';
import {
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
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
    });
  });

  describe('with custom options', () => {
    it('should work as expected', () => {
      visitResultQuickview();
    });
  });
});
