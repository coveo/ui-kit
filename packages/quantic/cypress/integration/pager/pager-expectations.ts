import {InterceptAliases} from '../../page-objects/search';
import {ConsoleExpectations} from '../console-expectations';
import {PagerSelector, PagerSelectors} from './pager-selectors';

function pagerExpectations(selector: PagerSelector) {
  return {
    displayPrevious: (display: boolean) => {
      selector.previous().should(display ? 'exist' : 'not.exist');
    },

    previousEnabled: (enabled: boolean) => {
      selector.previous().should(enabled ? 'be.enabled' : 'be.disabled');
    },

    displayNext: (display: boolean) => {
      selector.next().should(display ? 'exist' : 'not.exist');
    },

    nextEnabled: (enabled: boolean) => {
      selector.next().should(enabled ? 'be.enabled' : 'be.disabled');
    },

    numberOfPages: (value: number) => {
      selector.page().should('have.length', value);
    },

    selectedPageContains: (value: number) => {
      selector.selectedPage().should('contain', value.toString());
    },

    logPreviousPage: () => {
      cy.wait(InterceptAliases.UA.Pager.Previous).then((interception) => {
        const analyticsBody = interception.request.body;
        expect(analyticsBody).to.have.property('eventType', 'getMoreResults');
        expect(analyticsBody).to.have.property('eventValue', 'pagerPrevious');
      });
    },

    logNextPage: () => {
      cy.wait(InterceptAliases.UA.Pager.Next).then((interception) => {
        const analyticsBody = interception.request.body;
        expect(analyticsBody).to.have.property('eventType', 'getMoreResults');
        expect(analyticsBody).to.have.property('eventValue', 'pagerNext');
      });
    },

    logPageNumber: (value: number) => {
      cy.wait(InterceptAliases.UA.Pager.Number).then((interception) => {
        const analyticsBody = interception.request.body;
        expect(analyticsBody).to.have.property('eventType', 'getMoreResults');
        expect(analyticsBody).to.have.property('eventValue', 'pagerNumber');

        const customData = analyticsBody.customData;
        expect(customData).to.have.property('pagerNumber', value);
      });
    },
  };
}

export const PagerExpectations = {
  ...pagerExpectations(PagerSelectors),
  console: {
    ...ConsoleExpectations,
  },
};
