import {InterceptAliases} from '../../../page-objects/search';
import {completeSearchRequest} from '../../common-expectations';
import {SearchExpectations} from '../../search-expectations';
import {TabSelector, TabSelectors} from './tab-selectors';

function tabExpectations(selector: TabSelector) {
  return {
    displayTabs(displayed: boolean) {
      selector.tab().should(displayed ? 'exist' : 'not.exist');
    },

    numberOfTabs(value: number) {
      selector.tab().should('have.length', value);
    },

    tabsEqual(values: string[]) {
      selector.tab().then((elements) => {
        const captions = Cypress.$.makeArray(elements).map(
          (element) => element.innerText
        );

        expect(captions).to.deep.equal(values);
      });
    },

    activeTabContains(value: string) {
      selector.active().should('have.length', 1).should('contain', value);
    },

    constantQueryInSearchRequest: (
      body: Record<string, unknown>,
      value: string
    ) => {
      expect(body.cq).to.equal(value);
    },

    logSelected(value: string) {
      cy.wait(InterceptAliases.UA.Tab.InterfaceChange).then((interception) => {
        const analyticsBody = interception.request.body;
        expect(analyticsBody).to.have.property(
          'actionCause',
          'interfaceChange'
        );
        expect(analyticsBody).to.have.property('originLevel2', value);

        const customData = analyticsBody.customData;
        expect(customData).to.have.property('interfaceChangeTo', value);
      });
    },
  };
}

export const TabExpectations = {
  ...tabExpectations(TabSelectors),
  completeSearchRequest,
  search: SearchExpectations,
};
