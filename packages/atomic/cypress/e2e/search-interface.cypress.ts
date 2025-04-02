import {buildSearchEngine} from '@coveo/headless';
import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {TestFixture} from '../fixtures/test-fixture';
import {
  assertConsoleErrorMessage,
  assertConsoleWarning,
  assertConsoleWarningMessage,
} from './common-assertions';
import {addQuerySummary} from './query-summary-actions';
import {QuerySummarySelectors} from './query-summary-selectors';
import {
  getSearchInterface,
  searchInterfaceComponent,
  setInterfaceProp,
  setLanguage,
} from './search-interface-utils';

function entries<K extends PropertyKey, V>(obj: Record<K, V>): [K, V][] {
  return Object.entries(obj) as [K, V][];
}

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
      new TestFixture()
        .withoutInterfaceInitialization()
        .init()
        .waitForComponentHydration('atomic-search-interface');
    });

    describe('when calling "executeFirstSearch"', () => {
      beforeEach(() => {
        execSearch();
      });

      assertConsoleErrorMessage(engineError);
    });

    describe('when changing a prop too early', () => {
      entries({
        language: 'fr',
        pipeline: 'test',
        searchHub: 'abc',
      }).forEach(([propName, value]) => {
        describe(`when changing ${propName}`, () => {
          beforeEach(() => {
            cy.wait(300);
            setInterfaceProp(propName, value);
          });
          assertConsoleErrorMessage(engineError);
        });
      });
    });
  });

  describe('when initializing with an engine', () => {
    function setupWithEngine(options: {
      engine: {accessToken?: string; pipeline?: string; searchHub?: string};
      interface?: {pipeline?: string; searchHub?: string};
    }) {
      new TestFixture().withoutInterfaceInitialization().init();
      getSearchInterface(async (searchInterface) => {
        const sampleConfiguration = getSampleSearchEngineConfiguration();
        options.interface?.pipeline &&
          searchInterface.setAttribute('pipeline', options.interface!.pipeline);
        options.interface?.searchHub &&
          searchInterface.setAttribute(
            'search-hub',
            options.interface!.searchHub
          );
        const engine = buildSearchEngine({
          configuration: {
            accessToken:
              options.engine?.accessToken ?? sampleConfiguration.accessToken,
            organizationId: sampleConfiguration.organizationId,
            search: {
              pipeline: options.engine?.pipeline,
              searchHub: options.engine?.searchHub,
            },
          },
        });
        await searchInterface.initializeWithSearchEngine(engine);
      });
    }

    describe("when the access token isn't a JWT", () => {
      const enginePipeline = 'test';
      const engineSearchHub = 'hello';

      describe('when the search interface has nothing configured', () => {
        before(() =>
          setupWithEngine({
            engine: {pipeline: enginePipeline, searchHub: engineSearchHub},
          })
        );

        it("should update the interface's query pipeline and search hub to match the engine", () => {
          cy.get(searchInterfaceComponent).should(
            'have.attr',
            'pipeline',
            enginePipeline
          );
          cy.get(searchInterfaceComponent).should(
            'have.attr',
            'search-hub',
            engineSearchHub
          );
        });
      });

      describe('when the search interface has a configured query pipeline', () => {
        before(() =>
          setupWithEngine({
            engine: {pipeline: enginePipeline, searchHub: engineSearchHub},
            interface: {pipeline: enginePipeline + enginePipeline},
          })
        );

        assertConsoleWarningMessage(
          'A query pipeline is configured on the search interface element, but the search interface was initialized with an engine. You should only configure the query pipeline in the target engine.'
        );
      });

      describe('when the search interface has a configured search hub', () => {
        before(() =>
          setupWithEngine({
            engine: {pipeline: enginePipeline, searchHub: engineSearchHub},
            interface: {searchHub: engineSearchHub + engineSearchHub},
          })
        );

        assertConsoleWarningMessage(
          'A search hub is configured on the search interface element, but the search interface was initialized with an engine. You should only configure the search hub in the target engine.'
        );
      });
    });

    describe('when the access token is a JWT', () => {
      // expired search token where:
      // - searchHub = 'testing hub'
      // - pipeline = 'testing';
      // - userDisplayname = 'Alice Smith';

      const accessToken =
        // eslint-disable-next-line @cspell/spellchecker
        'eyJhbGciOiJIUzI1NiJ9.eyJwaXBlbGluZSI6InRlc3RpbmciLCJzZWFyY2hIdWIiOiJ0ZXN0aW5nIGh1YiIsInY4Ijp0cnVlLCJvcmdhbml6YXRpb24iOiJzZWFyY2h1aXNhbXBsZXMiLCJ1c2VySWRzIjpbeyJhdXRoQ29va2llIjoiIiwicHJvdmlkZXIiOiJFbWFpbCBTZWN1cml0eSBQcm92aWRlciIsIm5hbWUiOiJhc21pdGhAZXhhbXBsZS5jb20iLCJ0eXBlIjoiVXNlciIsImluZm9zIjp7fX1dLCJyb2xlcyI6WyJxdWVyeUV4ZWN1dG9yIl0sInVzZXJEaXNwbGF5TmFtZSI6IkFsaWNlIFNtaXRoIiwiZXhwIjoxNjQ2NzUzNDM0LCJpYXQiOjE2NDY2NjcwMzR9.p70UUYXKmg3sHU961G1Vmwp45qp8EgxvHisPMk-RUPw';
      const tokenPipeline = 'testing';
      const tokenSearchHub = 'testing hub';

      describe('when the search interface has nothing configured', () => {
        beforeEach(() =>
          setupWithEngine({
            engine: {accessToken},
          })
        );

        it('should not log any warning', () => {
          assertConsoleWarning(false);
        });

        it("should update the interface's query pipeline and search hub to match the token", () => {
          cy.get(searchInterfaceComponent).should(
            'have.attr',
            'pipeline',
            tokenPipeline
          );
          cy.get(searchInterfaceComponent).should(
            'have.attr',
            'search-hub',
            tokenSearchHub
          );
        });
      });

      describe('when the search interface has the same query pipeline and search hub as the token', () => {
        before(() =>
          setupWithEngine({
            engine: {accessToken},
            interface: {pipeline: tokenPipeline, searchHub: tokenSearchHub},
          })
        );

        it('should not log any warning', () => {
          assertConsoleWarning(false);
        });
      });

      describe('when the search interface has a configured query pipeline', () => {
        before(() =>
          setupWithEngine({
            engine: {accessToken},
            interface: {pipeline: tokenPipeline + tokenPipeline},
          })
        );

        assertConsoleWarningMessage(
          'A query pipeline is configured on the search interface element, but the search interface was initialized with an engine. You should only configure the query pipeline in the target engine.'
        );
      });

      describe('when the search interface has a configured search hub', () => {
        before(() =>
          setupWithEngine({
            engine: {accessToken},
            interface: {searchHub: tokenSearchHub + tokenSearchHub},
          })
        );

        assertConsoleWarningMessage(
          'A search hub is configured on the search interface element, but the search interface was initialized with an engine. You should only configure the search hub in the target engine.'
        );
      });
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

    it('should default back to the non region locale (e.g., "es-ES" to "es")', () => {
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
      setTranslation('fr', 'showing-results-of_other', 'patate');
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
        cy.wait(TestFixture.interceptAliases.UA).should('exist');
      });

      it('should include analytics in the search request', () => {
        cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) => {
          expect(firstSearch.request.body).to.have.property('analytics');
          expect(firstSearch.request.body.analytics).to.have.property(
            'actionCause',
            'interfaceLoad'
          );
          expect(firstSearch.request.body.analytics)
            .to.have.property('customData')
            .to.have.property('coveoAtomicVersion');
        });
      });
    });

    describe('without analytics', () => {
      beforeEach(() => {
        fixture.withoutAnalytics().init();
      });

      it('should not call the analytics server', () => {
        cy.wait(TestFixture.interceptAliases.Search);
        cy.shouldBeCalled(TestFixture.interceptAliases.UA, 0);
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
        cy.shouldBeCalled(TestFixture.interceptAliases.UA, 0);
      });

      it('should not include analytics in the search request', () => {
        cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) =>
          expect(firstSearch.request.body).not.to.have.property('analytics')
        );
      });
    });
  });
});
