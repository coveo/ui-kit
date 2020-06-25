export function getApiResponseBody(selector: string) {
  return new Promise((resolve) => {
    cy.wait(selector)
      .its('responseBody')
      .then(async (xhr) => {
        const response = await new Response(xhr as Blob).text();
        const jsonResponse = JSON.parse(response);
        resolve(jsonResponse);
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
