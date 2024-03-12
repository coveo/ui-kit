export function setCookieToEnableNextAnalytics(trackingId: string) {
  cy.setCookie('LSKey-c$Coveo-Pendragon', trackingId);
}
