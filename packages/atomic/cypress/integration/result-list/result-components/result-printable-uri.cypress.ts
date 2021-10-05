import {
  addTag,
  generateComponentHTML,
  TestFixture,
} from '../../../fixtures/test-fixture';
import {
  resultPrintableUriComponent,
  ResultPrintableUriSelectors,
} from './result-printable-uri-selector';
import * as CommonAssertions from '../../common-assertions';
import {
  addResultList,
  buildTemplateWithoutSections,
} from '../result-list-actions';
import {resultLinkComponent} from './result-link-selectors';
import {resultTextComponent} from './result-text-selectors';

describe('Result Printable Uri Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .with((e) => addTag(e, resultPrintableUriComponent, {}))
        .init();
    });

    it('should be removed from the DOM', () => {
      cy.get(resultPrintableUriComponent).should('not.exist');
    });
    CommonAssertions.assertConsoleError();
  });

  describe('when the "max-number-of-parts" prop is less than 3', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addResultList(
            buildTemplateWithoutSections([
              generateComponentHTML(resultPrintableUriComponent, {
                'max-number-of-parts': 2,
              }),
            ])
          )
        )
        .init();
    });

    it('should be removed from the DOM', () => {
      cy.get(resultPrintableUriComponent).should('not.exist');
    });

    CommonAssertions.assertConsoleError();
  });

  describe('when there is no "parents" property in the result object', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addResultList(
            buildTemplateWithoutSections([
              generateComponentHTML(resultPrintableUriComponent, {}),
            ])
          )
        )
        .withCustomResponse((response) => {
          response.results.forEach((result) => {
            delete result.raw.parents;
            result.printableUri = 'a printable uri';
          });
        })
        .init();
    });

    it('should render an "atomic-result-link" containing an "atomic-result-text" component displaying the "printableUri" property', () => {
      ResultPrintableUriSelectors.firstInResult()
        .find(resultTextComponent)
        .should('exist')
        .should('have.text', 'a printable uri');
    });
  });

  describe('when there is a "parents" property in the result object', () => {
    describe('when the number of parts is lower than or equal to the "number-of-parts" prop', () => {
      it.skip('should render all parts');
    });

    describe('when the number of parts is higher than the "number-of-parts" prop', () => {
      it.skip('should add an ellipsis before the last part');

      it.skip('clicking on the ellipsis should render all parts');
    });
  });
});
