import { TestFixture } from '../fixtures/test-fixture';
import { ComponentErrorSelectors } from './component-error-selectors';

export interface ComponentSelector {
  // Setting JQuery<HTMLElement> is incompatible with Stencil's HTML elements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shadow: () => Cypress.Chainable<JQuery<any>>;
}

export function should(should: boolean) {
  return should ? 'should' : 'should not';
}

export function assertAccessibility<T extends HTMLElement>(
  _component?: string | (() => Cypress.Chainable<JQuery<T>>)
) {
  return;
}

export function assertWCAG2_5_3<T extends HTMLElement>(
  _component?: string | (() => Cypress.Chainable<JQuery<T>>)
) {
  return;
}

// https://github.com/component-driven/cypress-axe#in-your-spec-file
// function logAxeIssues(violations: Result[]) {
//   cy.task(
//     'log',
//     `${violations.length} accessibility violation${
//       violations.length === 1 ? '' : 's'
//     } ${violations.length === 1 ? 'was' : 'were'} detected`
//   );
//   // pluck specific keys to keep the table readable
//   const violationData = violations.flatMap(({id, impact, description, nodes}) =>
//     // log per node so that we know which HTML element has the issue.
//     nodes.map((node) => ({
//       id,
//       impact,
//       description,
//       node: node.html,
//     }))
//   );

//   cy.task('table', violationData);
// }

export function assertAccessibilityWithoutIt<T extends HTMLElement>(
  _component?: string | (() => Cypress.Chainable<JQuery<T>>)
) {
  return;
}

export function assertContainsComponentError(
  componentSelector: ComponentSelector,
  display: boolean
) {
  it(`${should(display)} display an error component`, () => {
    componentSelector
      .shadow()
      .find(ComponentErrorSelectors.component, { includeShadowDom: true })
      .should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertContainsComponentErrorWithoutIt(
  componentSelector: ComponentSelector,
  display: boolean
) {
  componentSelector
    .shadow()
    .find(ComponentErrorSelectors.component, { includeShadowDom: true })
    .should(display ? 'be.visible' : 'not.exist');
}

export function assertConsoleError(error = true) {
  it(`${should(error)} log an error to the console`, () => {
    cy.get(TestFixture.consoleAliases.error).should(
      error ? 'be.called' : 'not.be.called'
    );
  });
}

export function assertConsoleErrorWithoutIt(error = true) {
  cy.get(TestFixture.consoleAliases.error).should(
    error ? 'be.called' : 'not.be.called'
  );
}

export function assertConsoleErrorMessage(msg: string) {
  it('should log an error containing the appropriate message to the console', () => {
    cy.getCalls(TestFixture.consoleAliases.error).should((calls) => {
      function isError(obj: unknown): obj is Error {
        return (
          !!obj &&
          typeof obj === 'object' &&
          'name' in obj &&
          typeof obj['name'] === 'string' &&
          'message' in obj &&
          typeof obj['message'] === 'string'
        );
      }

      expect(calls.length).to.be.greaterThan(0);
      const err = calls[calls.length - 1].args[0];
      isError(err)
        ? expect(err.message).to.contain(msg)
        : expect(err).to.contain(msg);
    });
  });
}

export function assertConsoleWarning(warn = true) {
  it(`${should(warn)} log a warning to the console`, () => {
    cy.get(TestFixture.consoleAliases.warn).should((spy) => {
      const calls = spy.getCalls();
      const filteredCalls = calls.filter(
        (call) => !call.args[0].includes('Lit is in dev mode.')
      );

      if (warn) {
        expect(filteredCalls).to.have.length.greaterThan(0);
      } else {
        expect(filteredCalls).to.have.lengthOf(0);
      }
    });
  });
}

export function assertConsoleWarningMessage(msg: string) {
  it('should log a warning containing the appropriate message to the console', () => {
    cy.get(TestFixture.consoleAliases.warn).should('be.calledWithMatch', msg);
  });
}

export function assertRemovesComponent() {
  assertConsoleErrorMessage(
    'Result component is in error and has been removed from the DOM'
  );
}

/**
 * @deprecated
 */
export function assertAriaLiveMessage(
  selector: () => Cypress.Chainable<JQuery<HTMLElement>>,
  message: string
) {
  it(`screen readers should read out "${message}".`, () => {
    selector().should('contain.text', message);
  });
}

export function assertAriaLiveMessageWithoutIt(
  selector: () => Cypress.Chainable<JQuery<HTMLElement>>,
  message: string
) {
  selector().should('contain.text', message);
}
