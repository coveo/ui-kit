import {TestFixture} from '../fixtures/test-fixture';
import {addQuerySummary} from './query-summary-actions';
import {QuerySummarySelectors} from './query-summary-selectors';
import {getSearchInterface, setLanguage} from './search-interface-utils';

describe('Search Interface Component', () => {
  const setTranslation = (lang: string, key: string, value: string) => {
    getSearchInterface((searchInterface) => {
      searchInterface.i18n.addResource(lang, 'translation', key, value);
    });
  };

  describe('with an automatic search', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addQuerySummary({'enable-duration': 'true'}))
        .init();
    });

    it('should support changing language', () => {
      setLanguage('fr');
      QuerySummarySelectors.text().should('contain', 'Résultats');

      setLanguage('en');
      QuerySummarySelectors.text().should('contain', 'Results');
    });

    it('should support changing a translation value without overriding other strings', () => {
      setTranslation('fr', 'showing-results-of_plural', 'patate');
      setLanguage('fr');

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

  describe('without an automatic search', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addQuerySummary())
        .withoutFirstAutomaticSearch()
        .init();
    });

    const execSearch = () =>
      getSearchInterface(($si) => $si.executeFirstSearch());

    it('should set locale for search request', async () => {
      setLanguage('fr');
      execSearch();
      cy.wait(TestFixture.interceptAliases.Search).then((intercept) => {
        expect(intercept.request.body.locale).to.be.eq('fr');
      });
    });

    it('should set language for analytics request', async () => {
      setLanguage('fr');
      execSearch();
      cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
        const analyticsBody = intercept.request.body;
        expect(analyticsBody).to.have.property('language', 'fr');
      });
    });
  });

  describe('without analytics', () => {
    beforeEach(() => {
      new TestFixture().withoutAnalytics().init();
    });

    it('should not call the analytics server', () => {
      cy.shouldBeCalled(TestFixture.urlParts.UA, 0);
    });
  });
});
