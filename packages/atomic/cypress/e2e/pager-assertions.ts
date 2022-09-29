import {PagerSelectors} from './pager-selectors';

export function assertFocusActivePage() {
  it('should focus on the active page', () => {
    PagerSelectors.buttonActivePage().should('be.focused');
  });
}
