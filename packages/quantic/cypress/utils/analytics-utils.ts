import {CyHttpMessages} from 'cypress/types/net-stubbing';

export function setCookieToEnableNextAnalytics(trackingId: string) {
  cy.setCookie('LSKey-c$Coveo-Pendragon', trackingId);
  cy.setCookie('Coveo-Pendragon', trackingId);
}

export function nextAnalyticsAlias(eventName: string) {
  return `@EP-${eventName}`;
}

export function aliasSubmitFeedbackEventRequest(
  request: CyHttpMessages.IncomingHttpRequest
) {
  const feedback = request?.body?.[0]?.feedback;
  if (feedback.liked) {
    request.alias = nextAnalyticsAlias('Qna.SubmitFeedback.Like').substring(1);
  } else if (feedback.reason) {
    request.alias = nextAnalyticsAlias(
      'Qna.SubmitFeedback.ReasonSubmit'
    ).substring(1);
  } else {
    request.alias = nextAnalyticsAlias('Qna.SubmitFeedback.Dislike').substring(
      1
    );
  }
}
