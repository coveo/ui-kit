import {configure} from '../../../page-objects/configurator';
import {
  extractResults,
  getQueryAlias,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../../page-objects/search';
import {scope} from '../../../reporters/detailed-collector';
import {stubConsoleError} from '../../console-selectors';
import {RecommendationListActions as Actions} from './recommendation-list-actions';
import {RecommendationListExpectations as Expect} from './recommendation-list-expectations';

const invalidPropertyErrorMessage =
  'The value of the recommendationsPerRow property must be an integer greater than 0.';

interface RecommendationListOptions {
  recommendation: string;
  numberOfRecommendations: number;
  recommendationsPerRow: number | string;
  label: string;
  fieldsToInclude: string;
  headingLevel: number;
  variant: 'grid' | 'carousel';
}

describe('quantic-recommendation-list', () => {
  const pageUrl = 's/quantic-recommendation-list';

  const defaultFieldsToInclude =
    'date,author,source,language,filetype,parents,sfknowledgearticleid';
  const defaultNumberOfRecommendations = 10;
  const defaultRecommendationsPerRow = 3;
  const defaultRecommendationId = 'Recommendation';
  const label = 'Top recommendation for you';
  const defaultHeadingLevel = 1;

  const registerRecommendationTemplatesEvent =
    'quantic__registerrecommendationtemplates';

  const recommendationsAlias = '@recommendations';

  function visitPage(options: Partial<RecommendationListOptions> = {}) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
  }

  function setupWithPauseBeforeRecommendationFetch() {
    interceptSearchIndefinitely();
    cy.visit(pageUrl);
    configure();
  }

  function setRecommendationsAlias() {
    cy.wait(getQueryAlias('search')).then((interception) => {
      const recommendations = extractResults(interception.response);
      cy.wrap(recommendations).as(recommendationsAlias.substring(1));
    });
  }

  describe('while loading the recommendations', () => {
    it('should properly render the placeholders', () => {
      setupWithPauseBeforeRecommendationFetch();

      Expect.displayPlaceholders(defaultNumberOfRecommendations);
      Expect.displayRecommendations(false);
    });
  });

  describe('with default options', () => {
    it('should properly display the recommendations', () => {
      visitPage({
        label,
      });
      setRecommendationsAlias();

      scope('when loading the page', () => {
        Expect.logRecommendationInterfaceLoad(recommendationsAlias);
        Expect.events.receivedEvent(true, registerRecommendationTemplatesEvent);
        Expect.displayLabel(label, defaultHeadingLevel);
        Expect.displayRecommendations(true);
        Expect.displayCarousel(false);
        Expect.recommendationsEqual(recommendationsAlias);
        Expect.correctFieldsIncluded(defaultFieldsToInclude.split(','));
        Expect.correctRecommendationId(defaultRecommendationId);
        Expect.correctNumberOfRecommendations(defaultNumberOfRecommendations);
        Expect.correctNumberOfRecommendationsPerRow(
          defaultRecommendationsPerRow
        );
        Actions.clickRecommendationLink(0);
        Expect.logRecommendationOpen(0, recommendationsAlias);
      });
    });
  });

  describe('with custom options', () => {
    const customFieldsToInclude =
      'source,language,sfcasestatus,sfcreatedbyname';
    const customNumberOfRecommendations = 3;
    const customNumberOfRecommendationsPerRow = 1;
    const customRecommendationId = 'Custom Recommendation Id';
    const customHeadingLevel = 3;

    it('should properly display the recommendations', () => {
      visitPage({
        fieldsToInclude: customFieldsToInclude,
        numberOfRecommendations: customNumberOfRecommendations,
        recommendationsPerRow: customNumberOfRecommendationsPerRow,
        recommendation: customRecommendationId,
        headingLevel: customHeadingLevel,
        label,
      });
      setRecommendationsAlias();

      scope('when loading the page', () => {
        Expect.logRecommendationInterfaceLoad(recommendationsAlias);
        Expect.events.receivedEvent(true, registerRecommendationTemplatesEvent);
        Expect.displayLabel(label, customHeadingLevel);
        Expect.displayRecommendations(true);
        Expect.displayCarousel(false);
        Expect.recommendationsEqual(recommendationsAlias);
        Expect.correctFieldsIncluded(customFieldsToInclude.split(','));
        Expect.correctRecommendationId(customRecommendationId);
        Expect.correctNumberOfRecommendations(customNumberOfRecommendations);
        Expect.correctNumberOfRecommendationsPerRow(
          customNumberOfRecommendationsPerRow
        );
        Actions.clickRecommendationLink(0);
        Expect.logRecommendationOpen(0, recommendationsAlias);
      });
    });
  });

  describe('when the recommendations are displayed in a carousel', () => {
    it('should properly display the recommendations inside a carousel', () => {
      visitPage({
        label,
        variant: 'carousel',
      });
      setRecommendationsAlias();

      scope('when loading the page', () => {
        Expect.logRecommendationInterfaceLoad(recommendationsAlias);
        Expect.events.receivedEvent(true, registerRecommendationTemplatesEvent);
        Expect.displayLabel(label, defaultHeadingLevel);
        Expect.displayCarousel(true);
        Expect.displayRecommendations(true);
        Expect.recommendationsEqual(recommendationsAlias);
        Expect.correctFieldsIncluded(defaultFieldsToInclude.split(','));
        Expect.correctRecommendationId(defaultRecommendationId);
        Expect.correctNumberOfRecommendations(defaultNumberOfRecommendations);
        Expect.correctNumberOfRecommendationsPerRow(
          defaultRecommendationsPerRow
        );
        Actions.clickRecommendationLink(0);
        Expect.logRecommendationOpen(0, recommendationsAlias);
      });
    });
  });

  describe('when invalid property values are passed', () => {
    describe('when the value of the property recommendationsPerRow is not a number', () => {
      it('should display an error message ', () => {
        cy.visit(pageUrl, {
          onBeforeLoad(win) {
            stubConsoleError(win);
          },
        });
        configure({
          recommendationsPerRow: 'invalid value',
        });

        scope('when loading the page', () => {
          Expect.console.error(true, invalidPropertyErrorMessage);
          Expect.displayComponentError(true);
        });
      });
    });

    describe('when the value of the property recommendationsPerRow is a negative value', () => {
      it('should display an error message ', () => {
        cy.visit(pageUrl, {
          onBeforeLoad(win) {
            stubConsoleError(win);
          },
        });
        configure({
          recommendationsPerRow: -1,
        });

        scope('when loading the page', () => {
          Expect.console.error(true, invalidPropertyErrorMessage);
          Expect.displayComponentError(true);
        });
      });
    });
  });
});
