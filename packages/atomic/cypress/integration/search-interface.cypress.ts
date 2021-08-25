import {RouteAlias, setUpPage} from '../utils/setupComponent';
import {i18n} from 'i18next';

type SearchInterface = HTMLElement & {
  language: string;
  i18n: i18n;
  executeFirstSearch: () => void;
};

describe('Search Interface Component', () => {
  const getSearchInterface = (
    cb: (searchInterface: SearchInterface) => void
  ) => {
    cy.get('atomic-search-interface').then(($el) => {
      cb($el.get(0) as SearchInterface);
    });
  };

  const setLanguage = (lang: string) => {
    getSearchInterface((searchInterface) => {
      searchInterface.language = lang;
    });
  };

  const setTranslation = (lang: string, key: string, value: string) => {
    getSearchInterface((searchInterface) => {
      searchInterface.i18n.addResource(lang, 'translation', key, value);
    });
  };

  describe('with an automatic search', () => {
    beforeEach(() => {
      setUpPage('<atomic-query-summary>', true);
    });

    it('should support changing language', () => {
      setLanguage('fr');
      cy.get('atomic-query-summary')
        .shadow()
        .invoke('text')
        .should('contain', 'Résultats');

      setLanguage('en');
      cy.get('atomic-query-summary')
        .shadow()
        .invoke('text')
        .should('contain', 'Results');
    });

    it('should support changing a translation value without overriding other strings', () => {
      setTranslation('fr', 'showing-results-of_plural', 'patate');
      setLanguage('fr');

      cy.get('atomic-query-summary')
        .shadow()
        .invoke('text')
        .should('contain', 'patate')
        .should('contain', 'seconde');
    });
  });

  describe('without an automatic search', () => {
    beforeEach(() => {
      setUpPage('<atomic-query-summary>', false);
    });

    const execSearch = () =>
      getSearchInterface(($si) => $si.executeFirstSearch());

    it('should set locale for search request', async () => {
      setLanguage('fr');
      execSearch();
      cy.wait(RouteAlias.search).then((intercept) => {
        expect(intercept.request.body.locale).to.be.eq('fr');
      });
    });

    it('should set language for analytics request', async () => {
      setLanguage('fr');
      execSearch();
      cy.wait(RouteAlias.analytics).then((intercept) => {
        const analyticsBody = intercept.request.body;
        expect(analyticsBody).to.have.property('language', 'fr');
      });
    });
  });
});
