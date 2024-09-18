import {nextAnalyticsAlias} from '../utils/analytics-utils';
import {interceptIndefinitely} from './search';

function uaAlias(eventName: string) {
  return `@UA-${eventName}`;
}

export const InterceptAliases = {
  UA: {
    SuggestionClick: uaAlias('suggestion_click'),
    SuggestionRate: uaAlias('suggestion_rate'),
    FieldUpdate: uaAlias('ticket_field_update'),
    ClassificationClick: uaAlias('ticket_classification_click'),
  },
  DocumentSuggestion: '@coveoDocumentSuggestion',
  CaseClassification: '@coveoCaseClassification',
  fetchPicklist: '@fetchPicklist',
};

export const routeMatchers = {
  analytics: new RegExp(/\/rest(\/ua)?\/v15\/analytics\//i),
  nextAnalytics: '**/events/v1?*',
  documentSuggestion: '**/rest/organizations/*/caseassists/*/documents/suggest',
  caseClassification: '**/rest/organizations/*/caseassists/*/classify',
  auraPicklistValues: '**/aura?*aura.RecordUi.getPicklistValuesByRecordType=1',
};

export function interceptCaseAssist() {
  return cy
    .intercept('POST', routeMatchers.analytics, (req) => {
      if (req.body.svc_action) {
        req.alias = uaAlias(req.body.svc_action).substring(1);
      }
    })
    .intercept('POST', routeMatchers.nextAnalytics, (req) => {
      const eventType = req.body?.[0]?.meta.type;
      req.alias = nextAnalyticsAlias(eventType).substring(1);
    });
}

export function interceptSuggestionIndefinitely(): {
  sendResponse: () => void;
} {
  return interceptIndefinitely(routeMatchers.documentSuggestion);
}

export function interceptClassificationsIndefinitely(): {
  sendResponse: () => void;
} {
  return interceptIndefinitely(routeMatchers.caseClassification);
}

export function interceptDocumentSuggestion() {
  cy.intercept(routeMatchers.documentSuggestion).as(
    InterceptAliases.DocumentSuggestion.substring(1)
  );
}

export function mockDocumentSuggestion(
  value: Array<object>,
  responseId?: string
) {
  cy.intercept(routeMatchers.documentSuggestion, (req) => {
    req.continue((res) => {
      res.body!.documents = value;
      if (responseId) {
        res.body!.responseId = responseId;
      }
      res.send();
    });
  }).as(InterceptAliases.DocumentSuggestion.substring(1));
}

export function mockCaseClassification(
  field: string,
  value: Array<object>,
  responseId?: string
) {
  cy.intercept(routeMatchers.caseClassification, (req) => {
    req.continue((res) => {
      res.body.fields[field].predictions = value;
      if (responseId) {
        res.body!.responseId = responseId;
      }
      res.send();
    });
  }).as(InterceptAliases.CaseClassification.substring(1));
}

export function mockSfPicklistValues(field: string, values: Array<object>) {
  cy.intercept(
    routeMatchers.auraPicklistValues,

    (req) => {
      req.continue((res) => {
        res.body.actions[0].returnValue.picklistFieldValues[field].values =
          values.map((value) => {
            return {...value, attributes: null};
          });
        res.send();
      });
    }
  ).as(InterceptAliases.fetchPicklist.substring(1));
}
