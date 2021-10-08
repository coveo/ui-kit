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
            result.clickUri = 'https://coveo.com';
          });
        })
        .init();
    });

    it('should render an "atomic-result-link" containing an "atomic-result-text" component displaying the "printableUri" property', () => {
      ResultPrintableUriSelectors.firstInResult()
        .find(resultTextComponent)
        .should('exist')
        .should('have.text', 'a printable uri');

      ResultPrintableUriSelectors.firstInResult()
        .find('a[part="result-printable-uri-link"]')
        .should('exist')
        .should('have.attr', 'href', 'https://coveo.com')
        .should('have.attr', 'target', '_self');
    });
  });

  describe('when there is a "parents" property in the result object', () => {
    describe('when the number of parts is lower than or equal to the "max-number-of-parts" prop', () => {
      beforeEach(() => {
        new TestFixture()
          .with(
            addResultList(
              buildTemplateWithoutSections([
                generateComponentHTML(resultPrintableUriComponent, {
                  'max-number-of-parts': '5',
                }),
              ])
            )
          )
          .withCustomResponse((response) => {
            response.results.forEach((result) => {
              result.raw.parents =
                '<?xml version="1.0" encoding="utf-16"?><parents><parent name="Organization" uri="https://lvu08-dev-ed.my.salesforce.com/home/home.jsp" /><parent name="Case" uri="https://lvu08-dev-ed.my.salesforce.com/500/o" /><parent name="lvu08-dev-ed.my.salesforce.com" uri="https://lvu08-dev-ed.my.salesforce.com/0D5f400002b7lEkCAI" /></parents>';
            });
          })
          .init();
      });
      it('should render all parts', () => {
        ResultPrintableUriSelectors.uriList().should('exist');
        ResultPrintableUriSelectors.uriListElements().should('have.length', 3);
      });

      it('should render href and link text based on parents property', () => {
        ResultPrintableUriSelectors.links()
          .should('exist')
          .first()
          .should(
            'have.attr',
            'href',
            'https://lvu08-dev-ed.my.salesforce.com/home/home.jsp'
          )
          .should('have.text', 'Organization');
      });
    });

    describe('when the number of parts is higher than the "max-number-of-parts" prop', () => {
      beforeEach(() => {
        new TestFixture()
          .with(
            addResultList(
              buildTemplateWithoutSections([
                generateComponentHTML(resultPrintableUriComponent, {
                  'max-number-of-parts': '3',
                }),
              ])
            )
          )
          .withCustomResponse((response) => {
            response.results.forEach((result) => {
              result.raw.parents =
                '<?xml version="1.0" encoding="utf-16"?><parents><parent name="atlas" uri="https://community.khoros.com/" /><parent name="atlas resources &amp; news" uri="https://community.khoros.com/t5/atlas-resources-news/ct-p/litho" /><parent name="khoros kudos awards" uri="https://community.khoros.com/t5/khoros-kudos-awards/ct-p/customerawards" /><parent name="khoros kudos awards 2020" uri="https://community.khoros.com/t5/khoros-kudos-awards-2020/con-p/kudosawards2020" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/khoros-kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/khoros-kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /></parents>';
            });
          })
          .init();
      });

      it('should add an ellipsis before the last part', () => {
        ResultPrintableUriSelectors.uriListElements()
          .eq(2)
          .find('button[part="result-printable-uri-list-ellipsis"]')
          .should('exist')
          .should('have.text', '...');
      });

      it('clicking on the ellipsis should render all parts', () => {
        ResultPrintableUriSelectors.ellipsisButton().click();
        ResultPrintableUriSelectors.ellipsisButton().should('not.exist');
        ResultPrintableUriSelectors.links().should('have.length.above', 3);
      });
    });
  });
});
