import {
  addTag,
  generateComponentHTML,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {
  addResultList,
  buildTemplateWithoutSections,
} from '../result-list-actions';
import * as ResultPrintableUriAssertions from './result-printable-uri-assertions';
import {
  resultPrintableUriComponent,
  ResultPrintableUriSelectors,
} from './result-printable-uri-selectors';
import {resultTextComponent} from './result-text-selectors';

const getNameForPart = (index: number) => `Parent ${index + 1}`;

const getUriForPart = (index: number) =>
  'https://fakewebsite.com/' +
  Array.from({length: index + 1}, (_, i) => `page${i + 1}`).join('/');

const addUriParentsInResponse =
  (numberOfParents: number) => (fixture: TestFixture) => {
    const parents = Array.from(
      {length: numberOfParents},
      (_, i) =>
        `<parent name="${getNameForPart(i)}" uri="${getUriForPart(i)}" />`
    ).join('');

    const fieldValue = `<?xml version="1.0" encoding="utf-16"?><parents>${parents}</parents>`;

    fixture.withCustomResponse((response) => {
      response.results.forEach((result) => {
        result.raw.parents = fieldValue;
      });
    });
  };

describe('Result Printable Uri Component', () => {
  describe('when not used inside a result template', () => {
    before(() => {
      new TestFixture()
        .with((e) => addTag(e, resultPrintableUriComponent, {}))
        .init();
    });

    CommonAssertions.assertConsoleError();
    CommonAssertions.assertRemovesComponent(() =>
      cy.get(resultPrintableUriComponent)
    );
  });

  describe('when the "max-number-of-parts" prop is not a number', () => {
    before(() => {
      new TestFixture()
        .with(
          addResultList(
            buildTemplateWithoutSections([
              generateComponentHTML(resultPrintableUriComponent, {
                'max-number-of-parts': 'yes',
              }),
            ])
          )
        )
        .init();
    });

    CommonAssertions.assertConsoleError();
    CommonAssertions.assertRemovesComponent(
      ResultPrintableUriSelectors.firstInResult
    );
  });

  describe('when the "max-number-of-parts" prop is less than 3', () => {
    before(() => {
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

    CommonAssertions.assertConsoleError();
    CommonAssertions.assertRemovesComponent(() =>
      cy.get(resultPrintableUriComponent)
    );
  });

  describe('when there is no "parents" property in the result object', () => {
    before(() => {
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

    it('should render an "atomic-result-printable-uri" containing an "atomic-result-text" component displaying the "printableUri" property', () => {
      ResultPrintableUriSelectors.firstInResult()
        .find(resultTextComponent)
        .should('exist')
        .should('have.text', 'a printable uri');

      ResultPrintableUriSelectors.links()
        .should('exist')
        .should('have.attr', 'href', 'https://coveo.com');
    });
  });

  describe('when there is a "parents" property in the result object and "max-number-of-parts" is 3', () => {
    const addResultListWithPrintableUri =
      (children?: HTMLElement[]) => (fixture: TestFixture) => {
        const printableUriEl = generateComponentHTML(
          resultPrintableUriComponent,
          {
            'max-number-of-parts': '3',
          }
        );
        children?.forEach((slot) => printableUriEl.appendChild(slot));
        fixture.with(
          addResultList(buildTemplateWithoutSections([printableUriEl]))
        );
      };

    describe('when the number of parts is 3', () => {
      before(() => {
        new TestFixture()
          .with(addResultListWithPrintableUri())
          .with(addUriParentsInResponse(3))
          .init();
      });

      ResultPrintableUriAssertions.assertDisplayEllipsis(false);
      ResultPrintableUriAssertions.assertDisplayParentsCount(3);

      it('should render href and link text based on parents property', () => {
        ResultPrintableUriSelectors.links()
          .should('exist')
          .first()
          .should('have.attr', 'href', getUriForPart(0))
          .should('have.text', getNameForPart(0));
      });
    });

    describe('when the number of parts is 4', () => {
      before(() => {
        new TestFixture()
          .with(addResultListWithPrintableUri())
          .with(addUriParentsInResponse(4))
          .init();
      });

      ResultPrintableUriAssertions.assertDisplayEllipsis(true);
      ResultPrintableUriAssertions.assertDisplayParentsCount(2);
      CommonAssertions.assertAccessibility(
        ResultPrintableUriSelectors.firstInResult
      );

      describe('after clicking on the ellipsis', () => {
        before(() => {
          ResultPrintableUriSelectors.ellipsisButton().click();
        });

        ResultPrintableUriAssertions.assertFocusLink(1);
        ResultPrintableUriAssertions.assertDisplayEllipsis(false);
        ResultPrintableUriAssertions.assertDisplayParentsCount(4);
      });
    });

    describe('when the number of parts is 20', () => {
      before(() => {
        new TestFixture()
          .with(addResultListWithPrintableUri())
          .with(addUriParentsInResponse(20))
          .init();
      });

      ResultPrintableUriAssertions.assertDisplayEllipsis(true);
      ResultPrintableUriAssertions.assertDisplayParentsCount(3);
    });

    describe('when there is a valid slot named "attributes"', () => {
      before(() => {
        const attributesSlot = generateComponentHTML('a', {
          download: 'test',
          target: '_self',
          slot: 'attributes',
        });
        new TestFixture()
          .with(addResultListWithPrintableUri([attributesSlot]))
          .with(addUriParentsInResponse(5))
          .init();
      });

      it('copies the attributes properly', () => {
        ResultPrintableUriSelectors.links()
          .should('have.attr', 'download', 'test')
          .should('have.attr', 'target', '_self');
      });
    });
  });
});
