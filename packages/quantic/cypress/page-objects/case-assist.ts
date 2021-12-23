import {interceptIndefinitely} from './search';

function uaAlias(eventName: string) {
  return `@UA-${eventName}`;
}

export const InterceptAliases = {
  UA: {
    FieldUpdate: uaAlias('ticket_field_update'),
    ClassificationClick: uaAlias('ticket_classification_click'),
  },
  CaseClassification: '@coveoCaseClassification',
  fetchPicklist: '@fetchPicklist',
};

export const routeMatchers = {
  analytics: '**/rest/ua/v15/analytics/*',
  caseClassification: '**/rest/organizations/*/caseassists/*/classify',
};

export function interceptCaseAssist() {
  return cy.intercept('POST', routeMatchers.analytics, (req) => {
    if (req.body.svc_action) {
      req.alias = uaAlias(req.body.svc_action).substring(1);
    }
  });
}

export function interceptClassificationsIndefinitely(): {
  sendResponse: () => void;
} {
  return interceptIndefinitely(routeMatchers.caseClassification);
}

export function mockCaseClassification(field: string, value: Array<object>) {
  cy.intercept(routeMatchers.caseClassification, (req) => {
    req.continue((res) => {
      res.body.fields[field].predictions = value;
      res.send();
    });
  }).as(InterceptAliases.CaseClassification.substring(1));
}

export function mockSfPicklistValues(field: string, values: Array<object>) {
  cy.intercept(
    {
      url: '**/aura?*',
      query: {'aura.RecordUi.getPicklistValuesByRecordType': '1'},
    },
    (req) => {
      req.continue((res) => {
        res.body?.actions?.[0]?.returnValue?.picklistFieldValues?.[
          field
        ]?.values = values.map((value) => {
          return {...value, attributes: null};
        });
        res.send();
      });
    }
  ).as(InterceptAliases.fetchPicklist.substring(1));
}
