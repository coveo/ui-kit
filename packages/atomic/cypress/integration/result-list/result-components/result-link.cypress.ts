import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {addResultList, buildTemplateWithSections} from '../result-list-actions';
import {
  resultLinkComponent,
  ResultLinkSelectors,
} from './result-link-selectors';
import * as CommonAssertions from '../../common-assertions';

interface ResultLinkProps {
  target?: '_self' | '_blank' | '_parent' | '_top';
}

const addResultLinkInResultList = (
  props: ResultLinkProps = {},
  slot?: HTMLElement
) => {
  const resultLinkEl = generateComponentHTML(
    resultLinkComponent,
    props as TagProps
  );
  if (slot) {
    resultLinkEl.appendChild(slot);
  }
  return addResultList(buildTemplateWithSections({title: resultLinkEl}));
};

describe('Result Link Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(resultLinkComponent))
        .init();
    });

    CommonAssertions.assertRemovesComponent(ResultLinkSelectors.shadow);
    CommonAssertions.assertConsoleError();
  });

  describe('when used inside a result template', () => {
    const clickUri = 'https://somefakewebsite.com/abc';
    const title = 'Abc result';
    function setupResultLink(
      target?: '_self' | '_blank' | '_parent' | '_top',
      slot?: HTMLElement
    ) {
      new TestFixture()
        .with(addResultLinkInResultList(target ? {target} : {}, slot))
        .withCustomResponse((response) =>
          response.results.forEach((result) => {
            result.clickUri = clickUri;
            result.title = title;
          })
        )
        .init();
    }

    it('the "target" prop should set the target on the "a" tag', () => {
      setupResultLink('_parent');
      ResultLinkSelectors.firstInResult()
        .find('a')
        .should('have.attr', 'target', '_parent');
    });

    it('the "href" attribute of the "a" tag should be the result\'s clickUri', () => {
      setupResultLink();
      ResultLinkSelectors.firstInResult()
        .find('a')
        .should('have.attr', 'href', clickUri);
    });

    describe('when there is a slot', () => {
      const slottedComponent = 'canvas';
      beforeEach(() => {
        setupResultLink(undefined, generateComponentHTML(slottedComponent));
      });

      it('should render the slot inside of the "a" tag', () => {
        ResultLinkSelectors.firstInResult()
          .find(slottedComponent)
          .should('exist');
      });
    });

    describe('when there is no slot', () => {
      beforeEach(() => {
        setupResultLink();
      });

      it('should render an "atomic-result-text" component containing the title', () => {
        ResultLinkSelectors.firstInResult().should('have.text', title);
      });
    });
  });
});
