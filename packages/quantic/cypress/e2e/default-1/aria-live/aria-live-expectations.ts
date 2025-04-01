import {should} from '../../common-selectors';
import {AriaLiveSelector, AriaLiveSelectors} from './aria-live-selectors';

function ariaLiveExpectations(selector: AriaLiveSelector) {
  return {
    numberOfRegions: (value: number) => {
      selector
        .regions()
        .should('have.length', value)
        .logDetail(`should contain ${value} aria-live regions`);
    },

    displayRegion: (name: string, display = true) => {
      selector
        .specificRegion(name)
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the ${name} region`);
    },

    regionContains: (name: string, text: string) => {
      selector
        .specificRegion(name)
        .contains(text)
        .logDetail(`The aria-live region ${name} should contain "${text}"`);
    },

    summaryRegionContainsSummaryText: () => {
      selector
        .summaryComponent()
        .should('exist')
        .then((elements) => {
          expect(
            selector
              .specificRegion('summary')
              .contains(elements.get(0).innerText)
          );
        });
    },

    noResultsRegionContainsNoResultsText: () => {
      selector
        .noResultsComponent()
        .should('exist')
        .then((elements) => {
          expect(
            selector
              .specificRegion('noresult')
              .contains(elements.get(0).innerText)
          );
        });
    },

    queryErrorRegionContainsQueryErrorText: () => {
      selector
        .queryErrorComponent()
        .should('exist')
        .then((elements) => {
          expect(
            selector
              .specificRegion('queryerror')
              .contains(elements.get(0).innerText)
          );
        });
    },
  };
}

export const AriaLiveExpectations = {
  ...ariaLiveExpectations(AriaLiveSelectors),
};
