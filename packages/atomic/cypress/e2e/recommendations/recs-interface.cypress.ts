import {TestRecsFixture} from '../../fixtures/test-recs-fixture';
import {
  assertConsoleError,
  assertConsoleErrorMessage,
} from '../common-assertions';
import {setLanguage, getRecommendations} from './recs-interface-utils';

describe('Recs Interface Component', () => {
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

  describe('without an automatic search', () => {
    beforeEach(() => {
      new TestRecsFixture().withLanguage('fr').withoutFirstIntercept().init();
    });

    it('should set locale for search request', (done) => {
      cy.wait(TestRecsFixture.interceptAliases.Search).then((intercept) => {
        expect(intercept.request.body.locale).to.be.eq('fr');
        done();
      });
    });

    it('should set language for analytics request', (done) => {
      cy.wait(TestRecsFixture.interceptAliases.UA).then((intercept) => {
        const analyticsBody = intercept.request.body;
        expect(analyticsBody).to.have.property('language', 'fr');
        done();
      });
    });
  });

  describe('without analytics', () => {
    beforeEach(() => {
      new TestRecsFixture().withoutAnalytics().init();
    });

    it('should not call the analytics server', () => {
      cy.shouldBeCalled(TestRecsFixture.urlParts.UASearch, 0);
    });
  });
});
