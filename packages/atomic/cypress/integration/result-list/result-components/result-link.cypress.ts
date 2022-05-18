import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import {addResultList, buildTemplateWithSections} from '../result-list-actions';
import {
  resultLinkComponent,
  ResultLinkSelectors,
} from './result-link-selectors';
import * as CommonAssertions from '../../common-assertions';
import {pickBy} from 'lodash';

interface ResultLinkOptions {
  target?: '_self' | '_blank' | '_parent' | '_top';
  slot?: HTMLElement;
  hrefTemplate?: string;
}

const addResultLinkInResultList = (
  props: TagProps = {},
  slot?: HTMLElement
) => {
  const resultLinkEl = generateComponentHTML(resultLinkComponent, props);
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
    const author = 'Albert';

    function setupResultLink({
      target,
      hrefTemplate,
      slot,
    }: ResultLinkOptions = {}) {
      new TestFixture()
        .with(
          addResultLinkInResultList(
            pickBy(
              {target: target, 'href-template': hrefTemplate},
              (property) => property !== undefined
            ) as TagProps,
            slot
          )
        )
        .withCustomResponse((response) =>
          response.results.forEach((result) => {
            result.clickUri = clickUri;
            result.title = title;
            result.raw.author = author;
          })
        )
        .init();
    }

    it('the "target" prop should set the target on the "a" tag', () => {
      setupResultLink({target: '_parent'});
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

    CommonAssertions.assertAccessibility(ResultLinkSelectors.firstInResult);

    describe('when there is a default slot', () => {
      const slottedComponent = document.createElement('div');
      slottedComponent.id = 'myslot';
      slottedComponent.innerText = 'Slotted element';
      beforeEach(() => {
        setupResultLink({slot: slottedComponent});
      });

      it('should render the slot inside of the "a" tag', () => {
        ResultLinkSelectors.firstInResult()
          .find('a #myslot')
          .should('be.visible');
      });
    });

    describe('when there is no default slot', () => {
      beforeEach(() => {
        setupResultLink();
      });

      it('should render an "atomic-result-text" component containing the title', () => {
        ResultLinkSelectors.firstInResult().should('have.text', title);
      });
    });

    describe('when there is a valid slot named "attributes"', () => {
      it('copies the attributes properly', () => {
        const slot = generateComponentHTML('a', {
          download: '',
          target: '_self',
        });
        setupResultLink({slot});
        ResultLinkSelectors.firstInResult()
          .find('a')
          .should('have.attr', 'download', '')
          .and('have.attr', 'target', '_self');
      });
    });

    describe('when setting the href-template prop', () => {
      it('builds the correct "href" attribute from the result object', () => {
        setupResultLink({hrefTemplate: '${clickUri}/${raw.author}/preview'});
        ResultLinkSelectors.firstInResult()
          .find('a')
          .should('have.attr', 'href', `${clickUri}/${author}/preview`);
      });

      it('builds the correct "href" attribute from the window object', () => {
        setupResultLink({hrefTemplate: 'http://${window.location.host}'});
        ResultLinkSelectors.firstInResult()
          .find('a')
          .should('have.attr', 'href', 'http://localhost:3333');
      });

      it('should filter out invalid protocols from the "href" attribute', () => {
        setupResultLink({hrefTemplate: 'javascript:sScript'});
        ResultLinkSelectors.firstInResult()
          .find('a')
          .should('have.attr', 'href', '');
      });
    });
  });
});
