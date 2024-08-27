import {AriaLiveSelectors} from './aria-live-selectors';

export const querySummaryComponent = 'atomic-query-summary';
export const QuerySummarySelectors = {
  host: () => cy.get(querySummaryComponent),
  shadow: () => cy.get(querySummaryComponent).shadow(),
  text: () => QuerySummarySelectors.shadow().invoke('text'),
  placeholder: () =>
    QuerySummarySelectors.shadow().find('[part="placeholder"]'),
  container: () => QuerySummarySelectors.shadow().find('[part="container"]'),
  duration: () => QuerySummarySelectors.shadow().find('[part="duration"]'),
  query: () => QuerySummarySelectors.shadow().find('[part~="query"]'),
  ariaLive: () => AriaLiveSelectors.region('query-summary'),
};
