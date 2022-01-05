import {TestFixture} from '../fixtures/test-fixture';
import {ComponentErrorSelectors} from './component-error-selectors';

export interface ComponentSelector {
  shadow: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

export function should(should: boolean) {
  return should ? 'should' : 'should not';
}

export function assertAccessibility(
  component: string | (() => Cypress.Chainable<JQuery<HTMLElement>>)
) {
  const rulesToIgnore = ['landmark-one-main', 'page-has-heading-one', 'region'];
  const rules = rulesToIgnore.reduce(
    (obj, rule) => ({...obj, [rule]: {enabled: false}}),
    {}
  );

  it('should pass accessibility tests', () => {
    if (typeof component === 'string') {
      cy.checkA11y(component, {rules});
    } else {
      component().should(([el]) => {
        cy.checkA11y(el, {rules});
      });
    }
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

export function assertConsoleError(error = true) {
  it(`${should(error)} log an error to the console`, () => {
    cy.get(TestFixture.consoleAliases.error).should(
      error ? 'be.called' : 'not.be.called'
    );
  });
}

export function assertRemovesComponent(
  selector: () => Cypress.Chainable<JQuery<HTMLElement>>
) {
  it('should remove the component from the DOM', () => {
    selector().should('not.exist');
  });
}

export function assertAriaLiveMessage(
  selector: () => Cypress.Chainable<JQuery<HTMLElement>>,
  message: string
) {
  it(`screen readers should read out "${message}".`, () => {
    selector().should('contain.text', message);
  });
}

export function assertNoAriaLiveMessage(
  selector: () => Cypress.Chainable<JQuery<HTMLElement>>
) {
  it('screen readers should not read out anything.', () => {
    selector().should('not.exist');
  });
}
