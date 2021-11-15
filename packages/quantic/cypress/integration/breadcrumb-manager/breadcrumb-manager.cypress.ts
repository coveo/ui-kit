import {configure} from '../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../page-objects/search';

describe('quantic-breadcrumb-manager', () => {
  const breadcrumbManagertUrl = 's/quantic-breadcrumb-manager';

  function visitBreadcrumbManager(waitForSearch = true) {
    interceptSearch();
    cy.visit(breadcrumbManagertUrl);
    configure();
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
    }
  }

  function loadFromUrlHash(urlHash: string) {
    interceptSearch();
    cy.visit(`${breadcrumbManagertUrl}#${urlHash}`);
    configure();
  }

  describe('when loading from URL', () => {
    it('should work as expected', () => {
      const path = 'Africa,Togo';
      const url = `cf[geographicalhierarchy]=${path}`;

      loadFromUrlHash(url);
    });
  });
});
