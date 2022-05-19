const cartesianProduct = (...a: any[]) =>
  a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));

describe('screenshots for result lists display mode', () => {
  const host = 'http://localhost:3333';

  const layouts = ['table', 'list', 'grid'];
  const densities = ['normal'];
  const imageSizes = ['none', 'icon', 'small', 'large'];
  const viewports = ['iphone-8', 'macbook-16'];
  const combinations: string[][] = cartesianProduct(
    layouts,
    densities,
    imageSizes,
    viewports
  );

  it('should display result list properly', () => {
    cy.visit(host);
    cy.wait(5000);
    combinations.forEach(([layout, density, imageSize, viewport]) => {
      cy.viewport(viewport as Cypress.ViewportPreset);
      cy.get('atomic-result-list').invoke('attr', 'display', layout);
      cy.get('atomic-result-list').invoke('attr', 'density', density);
      cy.get('atomic-result-list').invoke('attr', 'image-size', imageSize);
      cy.screenshot(
        `${viewport}-imageSize(${imageSize})-density(${density})-layout(${layout})`
      );
    });
  });
});
