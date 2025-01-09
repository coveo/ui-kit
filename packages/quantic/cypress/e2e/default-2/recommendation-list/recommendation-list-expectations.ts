import {Interception} from '../../../../../../node_modules/cypress/types/net-stubbing';
import {InterceptAliases} from '../../../page-objects/search';
import {
  ComponentErrorExpectations,
  getAnalyticsBodyFromInterception,
} from '../../common-expectations';
import {should} from '../../common-selectors';
import {ConsoleExpectations} from '../../console-expectations';
import {EventExpectations} from '../../event-expectations';
import {
  RecommendationListSelector,
  RecommendationListSelectors,
} from './recommendation-list-selectors';

interface Result {
  documentId: {contentIdKey: string; contentIdValue: string};
  title: string;
  uri: string;
  raw: {permanentid: string; urihash: string};
  ClickUri: string;
}

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

    displayCarousel: (display: boolean) => {
      selector
        .carousel()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the carousel`);
    },

    recommendationsEqual: (recommendationsAlias: string) => {
      cy.get<Array<{Title: string; clickUri: string}>>(
        recommendationsAlias
      ).then((recommendations) => {
        selector
          .recommendationLinks()
          .then((elements) => {
            return Cypress.$.makeArray(elements).map(
              (element) => element.innerText
            );
          })
          .should(
            'deep.equal',
            recommendations.map((result) => result.Title || result.clickUri)
          )
          .logDetail('should render the received recommendations');
      });
    },

    correctFieldsIncluded: (expectedFieldsToInclude: string[]) => {
      cy.get<Interception>(InterceptAliases.Search)
        .then((interception) => {
          const fieldsToInclude = interception.request.body.fieldsToInclude;
          expectedFieldsToInclude.forEach((field) =>
            expect(fieldsToInclude).to.include(field)
          );
        })
        .logDetail('should include the correct fields the request');
    },

    correctRecommendationId: (expectedRecommendationId: string) => {
      cy.get<Interception>(InterceptAliases.Search)
        .then((interception) => {
          const recommendationId = interception.request.body.recommendation;
          expect(recommendationId).to.equal(expectedRecommendationId);
        })
        .logDetail(
          'should send the correct recommendation id value in the request'
        );
    },

    correctNumberOfRecommendations: (
      expectedNumberOfRecommendations: number
    ) => {
      cy.get<Interception>(InterceptAliases.Search)
        .then((interception) => {
          const recommendationId = interception.request.body.numberOfResults;
          expect(recommendationId).to.equal(expectedNumberOfRecommendations);
        })
        .logDetail(
          'should send the correct number of recommendations value in the request'
        );
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

    logRecommendationOpen: (index: number, recommendationsAlias: string) => {
      cy.wait(InterceptAliases.UA.RecommendationOpen)
        .then((interception) => {
          const analyticsBody = getAnalyticsBodyFromInterception(interception);
          const customData = analyticsBody?.customData;
          cy.get<Array<Result>>(recommendationsAlias).then(
            (recommendations) => {
              const recommendation = recommendations[index];
              expect(analyticsBody).to.have.property(
                'documentTitle',
                recommendation.title
              );
              expect(analyticsBody).to.have.property(
                'documentUri',
                recommendation.uri
              );
              expect(analyticsBody).to.have.property(
                'documentUriHash',
                recommendation.raw.urihash
              );
              expect(analyticsBody).to.have.property(
                'documentUrl',
                recommendation.ClickUri
              );
              expect(customData).to.have.property(
                'contentIDValue',
                recommendation.raw.permanentid
              );
            }
          );
        })
        .logDetail('should log the recommendation open UA event');
    },

    logRecommendationInterfaceLoad: (recommendationsAlias: string) => {
      cy.wait(InterceptAliases.UA.RecommendationInterfaceLoad)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          cy.get<Array<Result>>(recommendationsAlias).then(
            (recommendations) => {
              const expectedPayload = recommendations.map((rec) => ({
                documentUri: rec.uri,
                documentUriHash: rec.raw.urihash,
              }));
              expect(analyticsBody.results).to.eql(expectedPayload);
            }
          );
        })
        .logDetail('should log the "recommendationInterfaceLoad" UA event');
    },
  };
}

export const RecommendationListExpectations = {
  ...recommendationListExpectations(RecommendationListSelectors),
  events: {
    ...EventExpectations,
  },
  ...ComponentErrorExpectations(RecommendationListSelectors),
  console: {
    ...ConsoleExpectations,
  },
};
