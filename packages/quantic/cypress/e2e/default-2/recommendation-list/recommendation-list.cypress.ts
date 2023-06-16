import {configure} from '../../../page-objects/configurator';
import {
  extractResults,
  getQueryAlias,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../../page-objects/search';
import {scope} from '../../../reporters/detailed-collector';
import {RecommendationListActions as Actions} from './recommendation-list-actions';
import {RecommendationListExpectations as Expect} from './recommendation-list-expectations';

interface RecommendationListOptions {
  recommendation: string;
  numberOfRecommendations: number | string;
  numberOfRecommendationsPerRow: number;
  label: string;
  fieldsToInclude: string;
  headingLevel: number;
}

describe('quantic-recommendation-list', () => {
  const pageUrl = 's/quantic-recommendation-list';

  const defaultFieldsToInclude =
    'date,author,source,language,filetype,parents,sfknowledgearticleid';
  const defaultNumberOfRecommendations = 10;
  const defaultNumberOfRecommendationsPerRow = 3;
  const defaultRecommendationId = 'Recommendation';
  const label = 'Top recommendation for you';
  const defaultHeadingLevel = 1;

  const registerRecommendationTemplatesEvent =
    'registerrecommendationtemplates';

  const recommendationsAlias = '@recommendations';

  function visitPage(options: Partial<RecommendationListOptions> = {}) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
  }

  function setupWithPauseBeforeSearch() {
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
      setupWithPauseBeforeSearch();

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
        Expect.events.receivedEvent(true, registerRecommendationTemplatesEvent);
        Expect.displayLabel(label, defaultHeadingLevel);
        Expect.displayRecommendations(true);
        Expect.recommendationsEqual(recommendationsAlias);
        Expect.correctFieldsIncluded(defaultFieldsToInclude.split(','));
        Expect.correctRecommendationId(defaultRecommendationId);
        Expect.correctNumberOfRecommendations(defaultNumberOfRecommendations);
        Expect.correctNumberOfRecommendationsPerRow(
          defaultNumberOfRecommendationsPerRow
        );
        Actions.clickRecommendationLink(0);
        Expect.logRecommendationOpen();
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
        numberOfRecommendationsPerRow: customNumberOfRecommendationsPerRow,
        recommendation: customRecommendationId,
        headingLevel: customHeadingLevel,
        label,
      });
      setRecommendationsAlias();

      scope('when loading the page', () => {
        Expect.events.receivedEvent(true, registerRecommendationTemplatesEvent);
        Expect.displayLabel(label, customHeadingLevel);
        Expect.displayRecommendations(true);
        Expect.recommendationsEqual(recommendationsAlias);
        Expect.correctFieldsIncluded(customFieldsToInclude.split(','));
        Expect.correctRecommendationId(customRecommendationId);
        Expect.correctNumberOfRecommendations(customNumberOfRecommendations);
        Expect.correctNumberOfRecommendationsPerRow(
          customNumberOfRecommendationsPerRow
        );
      });
    });
  });
});
