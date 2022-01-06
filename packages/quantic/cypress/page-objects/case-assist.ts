import {interceptIndefinitely} from './search';

function uaAlias(eventName: string) {
  return `@UA-${eventName}`;
}

export const InterceptAliases = {
  UA: {
    SuggestionClick: uaAlias('suggestion_click'),
    SuggestionRate: uaAlias('suggestion_rate'),
  },
  DocumentSuggestion: '@coveoDocumentSuggestion',
};

export const routeMatchers = {
  analytics: '**/rest/ua/v15/analytics/*',
  documentSuggestion: '**/rest/organizations/*/caseassists/*/documents/suggest',
};

export function interceptCaseAssist() {
  return cy.intercept('POST', routeMatchers.analytics, (req) => {
    if (req.body.svc_action) {
      req.alias = uaAlias(req.body.svc_action).substring(1);
    }
  });
}

export function interceptSuggestionIndefinitely(): {
  sendResponse: () => void;
} {
  return interceptIndefinitely(routeMatchers.documentSuggestion);
}

export function mockDocumentSuggestion(value: Array<object>) {
  cy.intercept(routeMatchers.documentSuggestion, (req) => {
    req.continue((res) => {
      res.body?.documents = value;
      res.send();
    });
  }).as(InterceptAliases.DocumentSuggestion.substring(1));
}
