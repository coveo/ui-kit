import {configure} from '../../page-objects/configurator';
import {
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
import {ResultQuickviewExpectations as Expect} from './result-quickview-expectations';
import {scope} from '../../reporters/detailed-collector';
import {Result} from '@coveo/headless/dist/definitions/index';

interface ResultQuickviewOptions {
  result: Result;
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
        Expect.isDisabled(false);
      });

      scope('when getting different results', () => {});
    });
  });

  describe('with custom options', () => {
    const customFieldsToInclude =
      'source,language,sfcasestatus,sfcreatedbyname';

    it('should work as expected', () => {
      visitResultQuickview();
    });
  });
});
