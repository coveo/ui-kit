import {Interception} from '../../../../../../node_modules/cypress/types/net-stubbing';
import {InterceptAliases} from '../../../page-objects/search';
import {should} from '../../common-selectors';
import {EventExpectations} from '../../event-expectations';
import {
  RecommendationListSelector,
  RecommendationListSelectors,
} from './recommendation-list-selectors';

export function recommendationListExpectations(
  selector: RecommendationListSelector
) {
  return {
    displayPlaceholders: (count: number) => {
      selector
        .placeholders()
        .should('have.length', count)
        .logDetail(`should display ${count} placeholders`);
    },

    displayLabel: (label: string, headingLevel: number) => {
      selector
        .label(headingLevel)
        .should('exist')
        .contains(label)
        .logDetail(`The label should contain "${label}"`);
    },

    displayRecommendations: (display: boolean) => {
      selector
        .recommendations()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display recommendations`);
    },

    recommendationsEqual: (recommendationsAlias: string) => {
      cy.get<Array<{Title: string}>>(recommendationsAlias).then(
        (recommendations) => {
          selector
            .recommendationLinks()
            .then((elements) => {
              return Cypress.$.makeArray(elements).map(
                (element) => element.innerText
              );
            })
            .should(
              'deep.equal',
              recommendations.map((result) => result.Title)
            )
            .logDetail('should render the received recommendations');
        }
      );
    },

    correctFieldsIncluded: (expectedFieldsToInclude: string[]) => {
      cy.get<Interception>(InterceptAliases.Search)
        .then((interception) => {
          const fieldsToInclude = interception.request.body.fieldsToInclude;
          expectedFieldsToInclude.forEach((field) =>
            expect(fieldsToInclude).to.include(field)
          );
        })
        .logDetail('fields to include should be in the request');
    },

    correctRecommendationId: (expectedRecommendationId: string) => {
      cy.get<Interception>(InterceptAliases.Search)
        .then((interception) => {
          const recommendationId = interception.request.body.recommendation;
          expect(recommendationId).to.equal(expectedRecommendationId);
        })
        .logDetail('recommendation id should be in the request');
    },

    correctNumberOfRecommendations: (
      expectedNumberOfRecommendations: number
    ) => {
      cy.get<Interception>(InterceptAliases.Search)
        .then((interception) => {
          const recommendationId = interception.request.body.numberOfResults;
          expect(recommendationId).to.equal(expectedNumberOfRecommendations);
        })
        .logDetail('recommendation id should be in the request');
    },

    correctNumberOfRecommendationsPerRow: (
      expectedNumberOfRecommendationsRow: number
    ) => {
      selector
        .recommendations()
        .invoke('css', 'width')
        .then((width) => {
          const recommendationWidth = parseInt(width.toString());
          selector
            .get()
            .invoke('css', 'width')
            .then((componentWidth) => {
              const expectedRecommendationWidth =
                parseInt(componentWidth.toString()) /
                expectedNumberOfRecommendationsRow;
              expect(recommendationWidth).to.equal(expectedRecommendationWidth);
            });
        })
        .logDetail(
          `should display ${expectedNumberOfRecommendationsRow} recommendations per row`
        );
    },

    logRecommendationOpen: () => {
      cy.wait(InterceptAliases.UA.RecommendationOpen).logDetail(
        'should log the recommendation open UA event'
      );
    },
  };
}

export const RecommendationListExpectations = {
  ...recommendationListExpectations(RecommendationListSelectors),
  events: {
    ...EventExpectations,
  },
};
