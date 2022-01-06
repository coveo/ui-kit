import {SearchBoxSelectors} from './search-box-selectors';

export function assertFocusSearchBox() {
  it('should focus on the search box', () => {
    SearchBoxSelectors.inputBox().should('be.focused');
  });
}

export function assertHasText(text: string) {
  it(`should contain "${text}"`, () => {
    SearchBoxSelectors.inputBox().should('have.value', text);
  });
}
