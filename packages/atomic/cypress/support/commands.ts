import {SinonSpy} from 'cypress/types/sinon';
import {AnalyticsTracker} from '../utils/analyticsUtils';

// eslint-disable @typescript/interface-name
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      map<T>(
        predicate: (subject: Subject, i: number, subjects: Subject[]) => T
      ): Chainable<T>;
      getTextOfAllElements(selector: string): Chainable<unknown>;
      // https://github.com/cypress-io/cypress-documentation/issues/108
      state(key: string): CypressRequest[];
      shouldBeCalled(urlPart: string, timesCalled: number): Chainable<unknown>;
      expectSearchEvent(actionCause: string): Chainable<unknown>;
      expectClickEvent(actionCause: string): Chainable<unknown>;
      expectCustomEvent(
        eventType: string,
        eventValue?: string
      ): Chainable<unknown>;
      distanceTo(
        getSubjectB: () => Chainable<JQuery<HTMLElement>>
      ): Chainable<{horizontal: number; vertical: number}>;
      getCalls<TArgs extends unknown[], TReturnValue>(
        fixture: string
      ): Chainable<sinon.SinonSpyCall<TArgs, TReturnValue>[]>;
    }
  }
}

Cypress.Commands.add('expectSearchEvent', (actionCause) => {
  cy.wrap(AnalyticsTracker)
    .invoke('getLastSearchEvent', actionCause)
    .should('not.be.null')
    .should((analyticsBody) => {
      return analyticsBody;
    });
});

Cypress.Commands.add('expectClickEvent', (actionCause) => {
  cy.wrap(AnalyticsTracker)
    .invoke('getLastClickEvent', actionCause)
    .should('not.be.null')
    .should((analyticsBody) => {
      return analyticsBody;
    });
});

Cypress.Commands.add('expectCustomEvent', (eventType, eventValue) => {
  cy.wrap(AnalyticsTracker)
    .invoke('getLastCustomEvent', eventType)
    .should('not.be.null')
    .should((analyticsBody) => {
      if (eventValue) {
        expect(analyticsBody).to.haveOwnProperty('eventValue', eventValue);
      }
      return analyticsBody;
    });
});

Cypress.Commands.add('map', {prevSubject: 'element'}, ($element, predicate) => {
  const elements = $element.toArray().map((element) => Cypress.$(element));
  cy.wrap(elements.map(predicate));
});

Cypress.Commands.add('getTextOfAllElements', (selector: string) => {
  cy.get(selector).then((elements) => {
    const originalValues = [...elements].map((el: HTMLElement) =>
      el.textContent?.trim()
    );
    cy.wrap(originalValues);
  });
});

interface CypressRequest {
  xhr: {url: string};
}

// Only possible to filter on the alias
Cypress.Commands.add('shouldBeCalled', (interceptAlias, timesCalled) => {
  // cy.state('aliasRequests') contains a map of all intercepted requests, with the number of times they've been called.
  // ie: {coveoSearch: 1, coveoAnalytics: 4}
  Object.entries(cy.state('aliasRequests')).forEach(([alias]) =>
    console.log('Should be called contains: ', alias)
  );
  const aliasRequestThatMatch = Object.entries(
    cy.state('aliasRequests')
  ).filter(
    ([alias]) =>
      alias.includes(interceptAlias) || interceptAlias.includes(alias)
  );
  const numCall = aliasRequestThatMatch[0] ? aliasRequestThatMatch[0][1] : 0;
  expect(
    numCall,
    `Intercept alias "${interceptAlias}"" should have been called ${timesCalled} times`
  ).to.equal(timesCalled);
});

Cypress.Commands.add(
  'distanceTo',
  {prevSubject: 'element'},
  ($elementA, getSubjectB) =>
    getSubjectB().then(([elementB]) => {
      const [elementA] = $elementA;
      return cy.wrap({
        get horizontal() {
          const rectA = elementA.getBoundingClientRect();
          const rectB = elementB.getBoundingClientRect();
          return rectB.left - rectA.right;
        },
        get vertical() {
          const rectA = elementA.getBoundingClientRect();
          const rectB = elementB.getBoundingClientRect();
          return rectB.top - rectA.bottom;
        },
      });
    })
);

Cypress.Commands.add('getCalls', (fixture) => {
  function isSinonSpy(obj: unknown): obj is SinonSpy<[], unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return 'getCalls' in (obj as any);
  }

  cy.get(fixture).should('satisfy', isSinonSpy).invoke('getCalls');
});

// Convert this to a module instead of script (allows import/export)
export {};
