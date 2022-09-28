import {InterceptAliases} from '../../page-objects/search';
import {should} from '../common-selectors';
import {ConsoleExpectations} from '../console-expectations';
import {PagerSelector, PagerSelectors} from './pager-selectors';

function pagerExpectations(selector: PagerSelector) {
  return {
    displayPrevious: (display: boolean) => {
      selector
        .previous()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the 'previous' button`);
    },

    previousEnabled: (enabled: boolean) => {
      selector
        .previous()
        .should(enabled ? 'be.enabled' : 'be.disabled')
        .logDetail(`the 'previous' button ${should(enabled)} be enabled`);
    },

    displayNext: (display: boolean) => {
      selector
        .next()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the 'next' button`);
    },

    nextEnabled: (enabled: boolean) => {
      selector
        .next()
        .should(enabled ? 'be.enabled' : 'be.disabled')
        .logDetail(`the 'next' button ${should(enabled)} be enabled`);
    },

    numberOfPages: (value: number) => {
      selector
        .page()
        .should('have.length', value)
        .logDetail(`should display ${value} page buttons`);
    },

    selectedPageContains: (value: number) => {
      selector
        .selectedPage()
        .should('contain', value.toString())
        .logDetail(`page '${value}' should be selected`);
    },

    logPreviousPage: () => {
      cy.wait(InterceptAliases.UA.Pager.Previous)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('eventType', 'getMoreResults');
          expect(analyticsBody).to.have.property('eventValue', 'pagerPrevious');
        })
        .logDetail("should log the 'pagerPrevious' UA event");
    },

    logNextPage: () => {
      cy.wait(InterceptAliases.UA.Pager.Next)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('eventType', 'getMoreResults');
          expect(analyticsBody).to.have.property('eventValue', 'pagerNext');
        })
        .logDetail("should log the 'pagerNext' UA event");
    },

    logPageNumber: (value: number) => {
      cy.wait(InterceptAliases.UA.Pager.Number)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('eventType', 'getMoreResults');
          expect(analyticsBody).to.have.property('eventValue', 'pagerNumber');

          const customData = analyticsBody.customData;
          expect(customData).to.have.property('pagerNumber', value);
        })
        .logDetail("should log the 'pagerNumber' UA event");
    },
  };
}

export const PagerExpectations = {
  ...pagerExpectations(PagerSelectors),
  console: {
    ...ConsoleExpectations,
  },
};
