import {setupIntercept} from '../fixtures/fixture-common';
import {TestFixture} from '../fixtures/test-fixture';
import {assertConsoleErrorMessage} from './common-assertions';
import {addQuerySummary} from './query-summary-actions';
import {QuerySummarySelectors} from './query-summary-selectors';
import {getSearchInterface, setLanguage} from './search-interface-utils';

describe('Search Interface Component', () => {
  const setTranslation = (lang: string, key: string, value: string) => {
    getSearchInterface((searchInterface) => {
      searchInterface.i18n.addResource(lang, 'translation', key, value);
    });
  };

  const execSearch = () =>
    getSearchInterface(($si) => $si.executeFirstSearch());

  const engineError =
    'You have to call "initialize" on the atomic-search-interface component before modifying the props or calling other public methods.';

  const setLanguageAndWait = (lang: string) => {
    setLanguage(lang);
    cy.wait(TestFixture.interceptAliases.Locale);
  };

  describe('before being initialized', () => {
    beforeEach(() => {
      new TestFixture().withoutInterfaceInitialization().init();
    });

    describe('when calling "executeFirstSearch"', () => {
      beforeEach(() => {
        execSearch();
      });
      assertConsoleErrorMessage(engineError);
    });

    describe('when changing a prop', () => {
      beforeEach(() => {
        cy.wait(300);
        setLanguage('fr');
      });
      assertConsoleErrorMessage(engineError);
    });
  });

  describe('with an automatic search', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addQuerySummary({'enable-duration': 'true'}))
        .init();
    });

    it('should support changing language', () => {
      setLanguageAndWait('fr');
      QuerySummarySelectors.text().should('contain', 'Résultats');

      setLanguageAndWait('en');
      QuerySummarySelectors.text().should('contain', 'Results');
    });

    it('should default back to english when language unavailable', () => {
      setLanguageAndWait('fr');
      setLanguage('jo');

      QuerySummarySelectors.text().should('contain', 'Results');
    });

    it('should default back to the non region localed (e.g., "es-ES" to "es")', () => {
      setLanguageAndWait('es-ES');

      QuerySummarySelectors.text().should('contain', 'Resultados');
    });

    it('should not log an error to the console when fetching non-existing languages', () => {
      setLanguageAndWait('es-ES');
      setLanguage('jo');

      cy.get(TestFixture.consoleAliases.error).should('not.be.called');
    });

    it('should work with lowercase regions', () => {
      setLanguageAndWait('zh-tw');

      QuerySummarySelectors.text().should('contain', '結果數');
    });

    it('should support adding a non-existing language', () => {
      setTranslation('jo', 'showing-results-of', 'hello');
      setLanguage('jo');
      cy.wait(200);

      QuerySummarySelectors.text().should('contain', 'hello');
    });

    it('should support changing a translation value without overriding other strings', () => {
      setTranslation('fr', 'showing-results-of_plural', 'patate');
      setLanguageAndWait('fr');

      QuerySummarySelectors.text()
        .should('contain', 'patate')
        .should('contain', 'seconde');
    });

    it('should log libraries versions in analytics custom data', () => {
      TestFixture.getUACustomData().then((customData) => {
        expect(customData).to.have.property('coveoAtomicVersion');
        expect(customData).to.have.property('coveoHeadlessVersion');
      });
    });
  });

  describe('without waiting for the automatic search', () => {
    let fixture: TestFixture;
    beforeEach(() => {
      fixture = new TestFixture().withoutFirstIntercept();
    });

    describe('with the language set to french and a query summary present', () => {
      beforeEach(() => {
        fixture.with(addQuerySummary()).withLanguage('fr').init();
      });

      it('should set locale for search request', (done) => {
        cy.wait(TestFixture.interceptAliases.Search).then((intercept) => {
          expect(intercept.request.body.locale).to.be.eq('fr');
          done();
        });
      });

      it('should set language for analytics request', (done) => {
        cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
          const analyticsBody = intercept.request.body;
          expect(analyticsBody).to.have.property('language', 'fr');
          done();
        });
      });
    });

    describe('by default (with analytics)', () => {
      beforeEach(() => {
        fixture.init();
      });

      it('should call the analytics server', () => {
        cy.wait(TestFixture.interceptAliases.Search);
        cy.shouldBeCalled(TestFixture.urlParts.UASearch, 1);
      });

      it('should include analytics in the search request', () => {
        cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) =>
          expect(firstSearch.request.body)
            .to.have.property('analytics')
            .to.have.property('actionCause', 'interfaceLoad')
        );
      });
    });

    describe('without analytics', () => {
      beforeEach(() => {
        fixture.withoutAnalytics().init();
      });

      it('should not call the analytics server', () => {
        cy.wait(TestFixture.interceptAliases.Search);
        cy.shouldBeCalled(TestFixture.urlParts.UASearch, 0);
      });

      it('should not include analytics in the search request', () => {
        cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) =>
          expect(firstSearch.request.body).not.to.have.property('analytics')
        );
      });
    });

    describe('with doNotTrack', () => {
      beforeEach(() => {
        fixture.withDoNotTrack().init();
      });

      it('should not call the analytics server', () => {
        cy.wait(TestFixture.interceptAliases.Search);
        cy.shouldBeCalled(TestFixture.urlParts.UASearch, 0);
      });

      it('should not include analytics in the search request', () => {
        cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) =>
          expect(firstSearch.request.body).not.to.have.property('analytics')
        );
      });
    });
  });
});
