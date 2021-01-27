export function getApiResponseBody(selector: string) {
  return new Promise((resolve) => {
    cy.wait(selector).then((interception) => {
      resolve(interception.response.body);
    });
  });
}

export function getUAFetch(selector: string) {
  return new Promise((resolve) => {
    cy.wait(selector).then((xhr) => {
      resolve(xhr);
    });
  });
}
