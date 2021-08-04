import {ComponentErrorSelectors} from './component-error-selectors';

export interface ComponentSelector {
  shadow: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

export function should(should: boolean) {
  return should ? 'should' : 'should not';
}

export function assertAccessibility(component: string) {
  it('should pass accessibility tests', () => {
    cy.checkA11y(component);
  });
}

export function assertContainsComponentError(
  componentSelector: ComponentSelector,
  display: boolean
) {
  it(`${should(display)} display an error component`, () => {
    componentSelector
      .shadow()
      .find(ComponentErrorSelectors.component)
      .should(display ? 'be.visible' : 'not.exist');
  });
}
