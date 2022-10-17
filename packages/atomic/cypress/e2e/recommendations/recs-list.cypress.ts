import {generateComponentHTML} from '../../fixtures/fixture-common';
import {TestRecsFixture} from '../../fixtures/test-recs-fixture';
import * as CommonAssertions from '../common-assertions';
import {buildTemplateWithSections} from '../result-list/result-list-actions';
import {withAnySectionnableResultList} from '../result-list/result-list-utils';
import * as RecsAssertions from './recs-list-assertions';
import {
  recsListComponent,
  resultTemplateComponent,
  RecsSelectors,
} from './recs-list-selectors';

export const addRecsList =
  (props = {}, template?: HTMLElement) =>
  (env: TestRecsFixture) => {
    const recsList = generateComponentHTML(recsListComponent, props);
    if (template) {
      recsList.appendChild(template);
    }
    env.withElement(recsList);
  };

const numberOfRecs = 3;
const numberOfRecsPerPage = 1;

describe('Recs Interface Component', () => {
  describe('before recommendation have loaded', () => {
    function setupWithoutFetchingRecs() {
      new TestRecsFixture()
        .withoutGetRecommendations()
        .with(addRecsList({'number-of-recommendations': numberOfRecs}))
        .init();
    }
    before(() => {
      setupWithoutFetchingRecs();
    });

    CommonAssertions.assertAccessibility();
    RecsAssertions.assertRendersPlaceholders(numberOfRecs);
  });

  describe('after recommendation have loaded', () => {
    function setupFetchingRecs() {
      new TestRecsFixture()
        .with(addRecsList({'number-of-recommendations': numberOfRecs}))
        .init();
    }
    before(() => {
      setupFetchingRecs();
    });

    CommonAssertions.assertConsoleError(false);
    CommonAssertions.assertAccessibility();
    RecsAssertions.assertRendersRecommendations(numberOfRecs);
  });

  describe('with a full result template', () => {
    function generateSimpleTextElement() {
      const element = generateComponentHTML('span');
      element.innerText =
        'I will not use meaningless placeholder text for testing';
      return element;
    }

    before(() => {
      new TestRecsFixture()
        .with(
          addRecsList(
            {'number-of-recommendations': numberOfRecs},
            buildTemplateWithSections(
              {
                visual: generateSimpleTextElement(),
                badges: generateSimpleTextElement(),
                actions: generateSimpleTextElement(),
                title: generateSimpleTextElement(),
                titleMetadata: generateSimpleTextElement(),
                emphasized: generateSimpleTextElement(),
                excerpt: generateSimpleTextElement(),
                bottomMetadata: generateSimpleTextElement(),
              },
              {},
              resultTemplateComponent
            )
          )
        )
        .init();
    });

    withAnySectionnableResultList(
      () => {
        CommonAssertions.assertAccessibility(recsListComponent);
      },
      {
        componentTag: recsListComponent,
        densities: ['normal'],
        imageSizes: ['icon', 'small'],
      }
    );
  });

  describe('with a unloaded carousel', () => {
    function setupCarousel() {
      new TestRecsFixture()
        .withoutGetRecommendations()
        .with(
          addRecsList({
            'number-of-recommendations': numberOfRecs,
            'number-of-recommendations-per-page': numberOfRecsPerPage,
          })
        )
        .init();
    }

    before(() => {
      setupCarousel();
    });

    RecsAssertions.assertRendersPlaceholders(numberOfRecsPerPage);
  });

  describe('with a loaded carousel', () => {
    function setupCarousel() {
      new TestRecsFixture()
        .with(
          addRecsList({
            'number-of-recommendations': numberOfRecs,
            'number-of-recommendations-per-page': numberOfRecsPerPage,
          })
        )
        .withCustomResponse((response) => {
          response.results.forEach((result, index) => {
            result.title = `${index}`;
          });
          return response;
        })
        .init();
    }

    describe('verify rendering', () => {
      before(() => {
        setupCarousel();
      });

      CommonAssertions.assertConsoleError(false);
      CommonAssertions.assertAccessibility();
      RecsAssertions.assertRendersRecommendations(numberOfRecsPerPage);
      RecsAssertions.assertRendersIndicators(
        numberOfRecs / numberOfRecsPerPage
      );
      RecsAssertions.assertIndicatorsActiveAtIndex(0);
      RecsAssertions.assertFirstRecommendationsContainsText('0');
    });

    describe('when going forwards', () => {
      before(() => {
        setupCarousel();
        RecsSelectors.nextButton().click();
      });

      RecsAssertions.assertIndicatorsActiveAtIndex(1);
      RecsAssertions.assertFirstRecommendationsContainsText('1');
    });

    describe('when going backwards', () => {
      before(() => {
        setupCarousel();
        RecsSelectors.previousButton().click();
      });

      RecsAssertions.assertIndicatorsActiveAtIndex(2);
      RecsAssertions.assertFirstRecommendationsContainsText('2');
    });

    describe('when going forward a full loop', () => {
      before(() => {
        setupCarousel();
        RecsSelectors.nextButton().click();
        RecsSelectors.nextButton().click();
        RecsSelectors.nextButton().click();
      });

      RecsAssertions.assertIndicatorsActiveAtIndex(0);
      RecsAssertions.assertFirstRecommendationsContainsText('0');
    });
  });
});
