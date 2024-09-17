import {TestRecsFixture} from '../../fixtures/test-recs-fixture';
import {
  assertConsoleError,
  assertConsoleErrorMessage,
} from '../common-assertions';
import {setLanguage, getRecommendations} from './recs-interface-utils';

// TODO: https://coveord.atlassian.net/browse/KIT-3540 - rewrite in playwright
describe.skip('Recs Interface Component', () => {
  const engineError =
    'You have to call "initialize" on the atomic-recs-interface component before modifying the props or calling other public methods.';

  describe('before being initialized', () => {
    beforeEach(() => {
      new TestRecsFixture().withoutInterfaceInitialization().init();
    });

    describe('when calling "getRecommendations"', () => {
      beforeEach(() => {
        getRecommendations();
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

  describe('when being initialized', () => {
    beforeEach(() => {
      new TestRecsFixture().withoutGetRecommendations().init();
    });

    assertConsoleError(false);
  });

  function verifyLanguageIntercepts(language: string) {
    it('should set locale for search request', (done) => {
      cy.wait(TestRecsFixture.interceptAliases.Search).then((intercept) => {
        expect(intercept.request.body.locale).to.be.eq(language);
        done();
      });
    });

    it('should set language for analytics request', (done) => {
      cy.wait(TestRecsFixture.interceptAliases.UA).then((intercept) => {
        const analyticsBody = intercept.request.body;
        expect(analyticsBody).to.have.property('language', language);
        done();
      });
    });
  }

  describe('initially setting language', () => {
    const language = 'fr';
    beforeEach(() => {
      new TestRecsFixture()
        .withLanguage(language)
        .withoutFirstIntercept()
        .init();
    });

    verifyLanguageIntercepts(language);
  });

  describe('updating the language after initialization', () => {
    const language = 'fr';
    beforeEach(() => {
      new TestRecsFixture().init();
      setLanguage('fr');
      getRecommendations();
    });

    verifyLanguageIntercepts(language);
  });

  describe('without analytics', () => {
    beforeEach(() => {
      new TestRecsFixture().withoutAnalytics().init();
    });

    it('should not call the analytics server', () => {
      cy.shouldBeCalled(TestRecsFixture.interceptAliases.UA, 0);
    });
  });
});
