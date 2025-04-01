import storedResponse from './storedResponse.json';

describe('screenshots for result lists display mode', () => {
  // Context: https://stackoverflow.com/a/50387233
  // This is a benign error that can be safely ignored
  const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
  Cypress.on('uncaught:exception', (err) => {
    if (resizeObserverLoopErrRe.test(err.message)) {
      return false;
    }
    return true;
  });

  const host = 'http://localhost:3333/visualTests.html';

  const layouts = ['table', 'list', 'grid'];
  const imageSizes = ['none', 'icon', 'small', 'large'];

  beforeEach(() => {
    cy.intercept('POST', '/rest/search/**/*', {
      statusCode: 201,
      body: storedResponse,
    }).as('mockResults');
  });

  it('should display result list properly', () => {
    cy.eyesOpen({
      appName: '@coveo/atomic',
      testName: 'Result templates',
    });

    cy.visit(host);
    cy.wait(5000);
    layouts.forEach((layout) => {
      imageSizes.forEach((imageSize) => {
        cy.get('atomic-result-list')
          .invoke('attr', 'display', layout)
          .invoke('attr', 'image-size', imageSize);
        cy.wait(400);

        cy.eyesCheckWindow({
          tag: `imageSize(${imageSize})-layout(${layout})`,
          target: 'window',
          fully: true,
        });
      });
    });
    cy.eyesClose();
  });
});
