import {InsightPanelsSelectors} from './insight-panel-selectors';

export const InsightPanelActions = {
  executeQuery: (query?: string) =>
    InsightPanelsSelectors.searchbox()
      .shadow()
      .find('input')
      .type(`${query}{enter}`),
};
