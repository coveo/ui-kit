import {configure} from '../../page-objects/configurator';
import {interceptSearch} from '../../page-objects/search';
import {StandaloneSearchBoxExpectations as Expect} from './standalone-search-box-expectations';
import {StandaloneSearchBoxActions as Actions} from './standalone-search-box-actions';

describe('quantic-standalone-search-box', () => {
  const standaloneSearchBoxUrl = 's/quantic-standalone-search-box';

  function visitStandaloneSearchBox() {
    interceptSearch();
    cy.visit(standaloneSearchBoxUrl);
    configure();
  }

  describe('with default option', () => {
    it('should work as expected', () => {
      visitStandaloneSearchBox();
    });
  });

  describe('with custom option', () => {
    it('should work as expected', () => {
      visitStandaloneSearchBox();
    });
  });
});
