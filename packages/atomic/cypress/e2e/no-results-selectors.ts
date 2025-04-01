import {AriaLiveSelectors} from './aria-live-selectors';

export const noResultsComponent = 'atomic-no-results';
export const NoResultsSelectors = {
  shadow: () => cy.get(noResultsComponent).shadow(),
  ariaLive: () => AriaLiveSelectors.region('no-results'),
};
