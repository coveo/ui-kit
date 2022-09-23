import {getFocusableDescendants} from '../../src/utils/accessibility-utils';
import {TestFixture} from '../fixtures/test-fixture';
import {ComponentErrorSelectors} from './component-error-selectors';

export interface ComponentSelector {
  // Setting JQuery<HTMLElement> is incompatible with Stencil's HTML elements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shadow: () => Cypress.Chainable<JQuery<any>>;
}

export function should(should: boolean) {
  return should ? 'should' : 'should not';
}

export function assertAccessibility<T extends HTMLElement>(
  component?: string | (() => Cypress.Chainable<JQuery<T>>)
) {
  const rulesToIgnore = ['landmark-one-main', 'page-has-heading-one', 'region'];
  const rules = rulesToIgnore.reduce(
    (obj, rule) => ({...obj, [rule]: {enabled: false}}),
    {}
  );

  it('should pass accessibility tests', () => {
    if (typeof component === 'string') {
      cy.checkA11y(component, {rules});
    } else if (typeof component === 'function') {
      component().should(([el]) => {
        cy.checkA11y(el, {rules});
      });
    } else {
      cy.checkA11y({}, {rules});
    }
  });

  it('every interactive element with innerText and an aria label passes WCAG success criterion 2.5.3', () => {
    function splitIntoWords(text: string) {
      return text
        .split(/\b/g)
        .filter((word) => !word.match(/[^a-z]/i))
        .map((word) => word.toLowerCase());
    }

    cy.window()
      .then((win) =>
        Array.from(getFocusableDescendants(win.document.body)).filter(
          (element) => element.hasAttribute('aria-label') && element.innerText
        )
      )
      .should((elements) =>
        Array.from(elements).forEach((element) =>
          expect(
            splitIntoWords(element.getAttribute('aria-label')!)
          ).to.include.all.members(
            splitIntoWords(element.innerText),
            'The aria-label should include the innerText. https://www.w3.org/WAI/WCAG22/Techniques/failures/F96.html'
          )
        )
      );
  });
}

export function assertContainsComponentError(
  componentSelector: ComponentSelector,
  display: boolean
) {
  it(`${should(display)} display an error component`, () => {
    componentSelector
      .shadow()
      .find(ComponentErrorSelectors.component, {includeShadowDom: true})
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

export function assertConsoleErrorMessage(msg: string) {
  it('should log an error containing the appropriate message to the console', () => {
    cy.get(TestFixture.consoleAliases.error).should('be.calledWithMatch', msg);
  });
}

export function assertConsoleWarning(warn = true) {
  it(`${should(warn)} log a warning to the console`, () => {
    cy.get(TestFixture.consoleAliases.warn).should(
      warn ? 'be.called' : 'not.be.called'
    );
  });
}

export function assertConsoleWarningMessage(msg: string) {
  it('should log a warning containing the appropriate message to the console', () => {
    cy.get(TestFixture.consoleAliases.warn).should('be.calledWithMatch', msg);
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
