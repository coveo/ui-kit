// eslint-disable-next-line n/no-extraneous-import
import {pickBy} from 'lodash';
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

interface ResultLinkOptions {
  target?: '_self' | '_blank' | '_parent' | '_top';
  slots?: HTMLElement[];
  hrefTemplate?: string;
}

const addResultLinkInResultList = (
  props: TagProps = {},
  slots?: HTMLElement[]
) => {
  const resultLinkEl = generateComponentHTML(resultLinkComponent, props);
  if (slots?.length) {
    slots.forEach((slot) => resultLinkEl.appendChild(slot));
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

    CommonAssertions.assertRemovesComponent();
  });

  describe('when used inside a result template', () => {
    const clickUri = 'https://somefakewebsite.com/abc';
    const title = 'Abc result';
    const author = 'Albert';

    function setupResultLink({hrefTemplate, slots}: ResultLinkOptions = {}) {
      new TestFixture()
        .with(
          addResultLinkInResultList(
            pickBy(
              {'href-template': hrefTemplate},
              (property) => property !== undefined
            ) as TagProps,
            slots
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

    it('the "href" attribute of the "a" tag should be the result\'s clickUri', () => {
      setupResultLink();
      ResultLinkSelectors.firstInResult()
        .find('a')
        .should('have.attr', 'href', clickUri);
    });
    it('should be accessible', () => {
      CommonAssertions.assertAccessibility(ResultLinkSelectors.firstInResult);
    });

    describe('when there is no default slot', () => {
      beforeEach(() => {
        setupResultLink();
      });

      it('should render an "atomic-result-text" component containing the title', () => {
        ResultLinkSelectors.firstInResult().first().should('have.text', title);
      });
    });

    describe('when there is a default slot', () => {
      const slottedComponent = document.createElement('div');
      slottedComponent.id = 'myslot';
      slottedComponent.innerText = 'Slotted element';
      beforeEach(() => {
        setupResultLink({slots: [slottedComponent]});
      });

      it('should render the slot inside of the "a" tag', () => {
        ResultLinkSelectors.firstInResult()
          .find('a #myslot')
          .should('be.visible');
      });
    });

    describe('when there is a default slot (empty string)', () => {
      const slottedComponent = document.createElement('div');
      slottedComponent.id = 'myslot';
      slottedComponent.innerText = 'Slotted element';
      slottedComponent.slot = '';
      beforeEach(() => {
        setupResultLink({slots: [slottedComponent]});
      });

      it('should render the default slot inside of the "a" tag', () => {
        ResultLinkSelectors.firstInResult()
          .find('a #myslot')
          .should('be.visible');
      });
    });

    describe('when there is a valid slot named "attributes"', () => {
      it('copies the attributes properly', () => {
        const attributesSlot = generateComponentHTML('a', {
          download: 'test',
          target: '_self',
          slot: 'attributes',
        });
        setupResultLink({slots: [attributesSlot]});
        ResultLinkSelectors.firstInResult()
          .find('a:not([slot])')
          .should('have.attr', 'download', 'test')
          .and('be.visible')
          .and('have.attr', 'target', '_self');
      });
    });

    describe('when there is a slot named "attributes" & a default slot', () => {
      beforeEach(() => {
        const attributesSlot = generateComponentHTML('a', {
          download: 'test',
          target: '_self',
          slot: 'attributes',
        });
        const defaultSlot = document.createElement('div');
        defaultSlot.id = 'myslot';
        defaultSlot.innerText = 'Slotted element';

        setupResultLink({slots: [attributesSlot, defaultSlot]});
      });

      it('copies the attributes properly', () => {
        ResultLinkSelectors.firstInResult()
          .find('a:not([slot])')
          .should('have.attr', 'download', 'test')
          .and('be.visible')
          .and('have.attr', 'target', '_self');
      });

      it('should render the default slot inside of the "a" tag', () => {
        ResultLinkSelectors.firstInResult()
          .find('a #myslot')
          .should('be.visible');
      });
    });

    describe('when there is a slot named "attributes" & a default slot (empty string)', () => {
      beforeEach(() => {
        const attributesSlot = generateComponentHTML('a', {
          download: 'test',
          target: '_self',
          slot: 'attributes',
        });
        const defaultSlot = document.createElement('div');
        defaultSlot.id = 'myslot';
        defaultSlot.innerText = 'Slotted element';
        defaultSlot.slot = '';

        setupResultLink({slots: [attributesSlot, defaultSlot]});
      });

      it('copies the attributes properly', () => {
        ResultLinkSelectors.firstInResult()
          .find('a:not([slot])')
          .should('have.attr', 'download', 'test')
          .and('be.visible')
          .and('have.attr', 'target', '_self');
      });

      it('should render the default slot inside of the "a" tag', () => {
        ResultLinkSelectors.firstInResult()
          .find('a #myslot')
          .should('be.visible');
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
