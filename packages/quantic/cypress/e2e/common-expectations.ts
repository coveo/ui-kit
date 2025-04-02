import {CyHttpMessages, Interception} from 'cypress/types/net-stubbing';
import {getQueryAlias} from '../page-objects/search';
import {useCaseEnum} from '../page-objects/use-case';
import {ComponentErrorSelector, should} from './common-selectors';

export function completeSearchRequest(
  actionCause: string,
  useCase?: 'search' | 'insight',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  checkSearchRequestBodyCallback?: (body: Record<string, any>) => void
) {
  cy.wait(getQueryAlias(useCase))
    .then((interception) => {
      const body = interception.request.body;
      const analyticsSection = body.analytics;

      expect(analyticsSection).to.exist;
      expect(analyticsSection).to.have.property('actionCause', actionCause);
      checkSearchRequestBodyCallback?.(body);
    })
    .logDetail(
      `should send a new ${useCase === useCaseEnum.insight ? 'insight' : ''} search request caused by ${actionCause}`
    );
}

export function logUaEvent(
  requestAlias: string,
  uaEvent: string,
  bodyData: Record<string, string | number | boolean>,
  customData?: Record<string, string | number | boolean>
) {
  return cy
    .wait(requestAlias)
    .then((interception) => {
      const analyticsBody = getAnalyticsBodyFromInterception(interception);

      Object.keys(bodyData).forEach((key: string) => {
        expect(analyticsBody).to.have.property(key, bodyData[key]);
      });

      if (customData) {
        expect(analyticsBody).to.have.property('customData');
        Object.keys(customData).forEach((key) => {
          expect(analyticsBody.customData).to.have.property(
            key,
            customData[key]
          );
        });
      }
    })
    .logDetail(`should log the "${uaEvent}" UA event`);
}

export function ComponentErrorExpectations(selector: ComponentErrorSelector) {
  return {
    displayComponentError: (display: boolean) => {
      selector
        .componentError()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the error component`);
    },

    displayComponentErrorMessage: (message: string) => {
      selector
        .componentErrorMessage()
        .should('exist')
        .should('contain', message)
        .logDetail('should display the correct component error message');
    },
  };
}

export function getAnalyticsBodyFromInterception(interception: Interception) {
  return getAnalyticsBodyFromRequest(interception.request);
}

export function getAnalyticsBodyFromRequest(
  req: CyHttpMessages.IncomingRequest
) {
  // Some analytics request won't be application/json, but will be form-url-encoded (specifically, click events).
  // Need to decode them if that's the case

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let analyticsBody: Record<string, any>;
  if (typeof req.body === 'string') {
    analyticsBody = JSON.parse(
      decodeURIComponent(req.body).replace('clickEvent=', '')
    );
  } else {
    analyticsBody = req.body;
  }

  return analyticsBody;
}
