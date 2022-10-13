import {
  TestFeature,
  SearchResponseModifier,
  SearchResponseModifierPredicate,
  interceptSearchResponse,
  TestFixture,
} from './test-fixture';
import {i18n} from 'i18next';
import {buildTestUrl} from '../utils/setupComponent';
import {AnalyticsTracker, AnyEventRequest} from '../utils/analyticsUtils';

export type RecsInterface = HTMLElement & {
  initialize: (opts: {
    accessToken: string;
    organizationId: string;
  }) => Promise<void>;
  getRecommendations: () => void;
  i18n: i18n;
  language: string;
};

export class TestRecsFixture {
  private aliases: TestFeature<TestRecsFixture>[] = [];
  private firstIntercept = true;
  private getRecs = true;
  private initializeInterface = true;
  private recsInterface = document.createElement(
    'atomic-recs-interface'
  ) as RecsInterface;
  private style = document.createElement('style');
  private language?: string;
  private disabledAnalytics = false;
  private fieldCaptions: {field: string; captions: Record<string, string>}[] =
    [];
  private translations: Record<string, string> = {};
  private responseModifiers: SearchResponseModifier[] = [];
  private returnError = false;

  public with(feat: TestFeature<TestRecsFixture>) {
    feat(this);
    return this;
  }

  public withoutInterfaceInitialization() {
    this.withoutGetRecommendations();
    this.initializeInterface = false;
    return this;
  }

  public withoutGetRecommendations() {
    this.getRecs = false;
    return this;
  }
  public withoutFirstIntercept() {
    this.firstIntercept = false;
    return this;
  }

  public withElement(e: HTMLElement) {
    this.recsInterface.append(e);
    return this;
  }

  public withAlias(aliasFn: TestFeature<TestRecsFixture>) {
    this.aliases.push(aliasFn);
    return this;
  }

  public withStyle(e: string) {
    this.style.append(e);
    return this;
  }

  public withLanguage(lang: string) {
    this.language = lang;
    return this;
  }

  public withoutAnalytics() {
    this.disabledAnalytics = true;
    return this;
  }

  public withFieldCaptions(field: string, captions: Record<string, string>) {
    this.fieldCaptions.push({field, captions});
    return this;
  }

  public withTranslation(translations: Record<string, string>) {
    this.translations = {
      ...this.translations,
      ...translations,
    };
    return this;
  }

  public withCustomResponse(
    predicate: SearchResponseModifierPredicate,
    times = 9999
  ) {
    this.responseModifiers.push({predicate, times});
    return this;
  }

  public withNoRecs() {
    return this.withCustomResponse((r) => {
      r.results = [];
      r.totalCountFiltered = 0;
      return r;
    });
  }

  public withError() {
    this.returnError = true;
    return this;
  }

  public withViewport(viewport: Cypress.ViewportPreset) {
    cy.viewport(viewport);
    return this;
  }

  public withMobileViewport() {
    return this.withViewport('iphone-x');
  }

  public init() {
    cy.visit(buildTestUrl());
    cy.injectAxe();
    this.intercept();
    this.stubConsole();

    cy.document().then((doc) => {
      doc.head.appendChild(this.style);
      doc.body.appendChild(this.recsInterface);
    });

    cy.get('atomic-recs-interface').then(($si) => {
      const recsInterfaceComponent = $si.get()[0] as RecsInterface;

      if (this.language) {
        recsInterfaceComponent.setAttribute('language', this.language);
      }

      if (this.disabledAnalytics) {
        recsInterfaceComponent.setAttribute('analytics', 'false');
      } else {
        AnalyticsTracker.reset();
        cy.intercept(
          {
            method: 'POST',
            url: '**/rest/ua/v15/analytics/*',
          },
          (request) => AnalyticsTracker.push(request.body as AnyEventRequest)
        );
      }

      if (this.responseModifiers.length) {
        interceptSearchResponse((response) => {
          let combinedResponse = response;
          this.responseModifiers.forEach((modifier) => {
            if (modifier.times <= 0) {
              return;
            }
            combinedResponse =
              modifier.predicate(combinedResponse) || combinedResponse;
            modifier.times--;
          });
          return combinedResponse;
        });
      }

      if (this.returnError) {
        cy.intercept(
          {
            method: 'POST',
            url: '**/rest/search/v2?*',
          },
          (request) =>
            request.reply((response) =>
              response.send(418, {
                exception: {code: 'Something very weird just happened'},
              })
            )
        ).as(TestRecsFixture.interceptAliases.Search.substring(1));
      }

      if (!this.initializeInterface) {
        return;
      }

      recsInterfaceComponent
        .initialize({
          accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
          organizationId: 'searchuisamples',
        })
        .then(() => {
          this.fieldCaptions.forEach(({field, captions}) =>
            recsInterfaceComponent.i18n.addResourceBundle(
              'en',
              `caption-${field}`,
              captions
            )
          );
          recsInterfaceComponent.i18n.addResourceBundle(
            'en',
            'translation',
            this.translations
          );
          if (this.getRecs) {
            recsInterfaceComponent.getRecommendations();
          }
        });
    });

    if (this.getRecs && this.firstIntercept) {
      cy.wait(TestRecsFixture.interceptAliases.Search);
      if (!this.disabledAnalytics) {
        cy.wait(TestRecsFixture.interceptAliases.UA);
      }
    }

    this.aliases.forEach((alias) => alias(this));

    return this;
  }

  public static interceptAliases = TestFixture.interceptAliases;
  public static consoleAliases = TestFixture.consoleAliases;
  public static urlParts = TestFixture.urlParts;

  private intercept() {
    cy.intercept({
      method: 'POST',
      path: '**/rest/ua/v15/analytics/*',
    }).as(TestRecsFixture.interceptAliases.UA.substring(1));

    cy.intercept({
      method: 'POST',
      url: '**/rest/search/v2?*',
    }).as(TestRecsFixture.interceptAliases.Search.substring(1));

    cy.intercept({
      method: 'GET',
      path: '/build/lang/**.json',
    }).as(TestRecsFixture.interceptAliases.Locale.substring(1));
  }

  private stubConsole() {
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as(
        TestRecsFixture.consoleAliases.error.substring(1)
      );
      cy.stub(win.console, 'warn').as(
        TestRecsFixture.consoleAliases.warn.substring(1)
      );
      cy.stub(win.console, 'log').as(
        TestRecsFixture.consoleAliases.log.substring(1)
      );
    });
  }
}
