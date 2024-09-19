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

// TODO: https://coveord.atlassian.net/browse/KIT-3540 - rewrite in playwright
describe.skip('Recs Interface Component', () => {
  describe('before recommendation have loaded', () => {
    beforeEach(() => {
      new TestRecsFixture()
        .withoutGetRecommendations()
        .with(addRecsList({'number-of-recommendations': numberOfRecs}))
        .init();
    });

    it('verify accessibility and placeholders', () => {
      CommonAssertions.assertAccessibility();
      RecsAssertions.assertRendersPlaceholders(numberOfRecs);
    });
  });

  describe('after recommendation have loaded', () => {
    beforeEach(() => {
      new TestRecsFixture()
        .with(addRecsList({'number-of-recommendations': numberOfRecs}))
        .init();
    });

    it('verify accessibility and recommendations', () => {
      CommonAssertions.assertConsoleError(false);
      CommonAssertions.assertAccessibility();
      RecsAssertions.assertRendersRecommendations(numberOfRecs);
    });
  });

  describe('with a full result template', () => {
    function generateSimpleTextElement() {
      const element = generateComponentHTML('span');
      element.innerText =
        'I will not use meaningless placeholder text for testing';
      return element;
    }
    beforeEach(() => {
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
        useBeforeEach: true,
      }
    );
  });

  describe('with a unloaded carousel', () => {
    beforeEach(() => {
      // Setup Carousel
      new TestRecsFixture()
        .withoutGetRecommendations()
        .with(
          addRecsList({
            'number-of-recommendations': numberOfRecs,
            'number-of-recommendations-per-page': numberOfRecsPerPage,
          })
        )
        .init();
    });
    it('verify placeholders', () => {
      RecsAssertions.assertRendersPlaceholders(numberOfRecsPerPage);
    });
  });

  describe('with a loaded carousel', () => {
    beforeEach(() => {
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
    });

    it('verify rendering and going forward/backward', () => {
      CommonAssertions.assertConsoleError(false);
      CommonAssertions.assertAccessibility();
      RecsAssertions.assertRendersIndicators(
        numberOfRecs / numberOfRecsPerPage
      );
      RecsAssertions.assertIndicatorsActiveAtIndex(0);
      RecsAssertions.assertFirstRecommendationsContainsText('0');
      // Going forward
      RecsSelectors.nextButton().click();
      RecsAssertions.assertIndicatorsActiveAtIndex(1);
      RecsAssertions.assertFirstRecommendationsContainsText('1');
      // Going backward full loop
      RecsSelectors.previousButton().click();
      RecsSelectors.previousButton().click();
      RecsAssertions.assertIndicatorsActiveAtIndex(2);
      RecsAssertions.assertFirstRecommendationsContainsText('2');
      // Going forward full loop
      RecsSelectors.nextButton().click();
      RecsAssertions.assertIndicatorsActiveAtIndex(0);
      RecsAssertions.assertFirstRecommendationsContainsText('0');
    });
  });
});
