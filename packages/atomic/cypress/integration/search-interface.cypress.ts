import {setUpPage} from '../utils/setupComponent';
import {i18n} from 'i18next';

type SearchInterface = HTMLElement & {
  language: string;
  i18n: i18n;
};

describe('Search Interface Component', () => {
  beforeEach(() => {
    setUpPage('<atomic-query-summary>', true);
  });

  const getSearchInterface = (
    cb: (searchInterface: SearchInterface) => void
  ) => {
    cy.get('atomic-search-interface').then(($el) => {
      cb(
        $el.get(0) as HTMLElement & {
          language: string;
          i18n: i18n;
        }
      );
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
    setTranslation('fr', 'showingResultsOf_plural', 'patate');
    setLanguage('fr');

    cy.get('atomic-query-summary')
      .shadow()
      .invoke('text')
      .should('contain', 'patate');

    cy.get('atomic-query-summary')
      .shadow()
      .invoke('text')
      .should('contain', 'seconde');
  });
});
